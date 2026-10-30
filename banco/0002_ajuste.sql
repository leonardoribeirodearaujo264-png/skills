-- Ajuste para bancos onde a primeira versão do 0001_loja.sql já foi rodada.
-- Pode rodar mais de uma vez: só cria o que falta e reaplica preços, policies e funções.
-- Banco novo não precisa deste arquivo: o 0001_loja.sql atual já tem tudo.

-- Colunas novas ------------------------------------------------------------------
alter table loja_produtos add column if not exists preco_avulso_centavos int
  check (preco_avulso_centavos is null or preco_avulso_centavos between 100 and 10000000);
alter table loja_ofertas add column if not exists exige_cliente boolean not null default false;
alter table loja_pedidos add column if not exists pagamentos_estornados text[] not null default '{}';
alter table loja_pedidos add column if not exists email_acesso_enviado_em timestamptz;

-- Produtos: quem comprou continua vendo; caminhos de arquivo fora da API pública ---------
drop policy if exists produtos_vitrine on loja_produtos;
drop policy if exists produtos_vitrine_ou_comprado on loja_produtos;
create policy produtos_vitrine on loja_produtos for select to anon using (ativo);
create policy produtos_vitrine_ou_comprado on loja_produtos for select to authenticated
  using (ativo or exists (
    select 1 from loja_acessos a
    where a.produto_slug = loja_produtos.slug and a.user_id = (select auth.uid()) and a.revogado_em is null
  ));
revoke select on loja_produtos from anon, authenticated;
grant select (slug, titulo, resumo, ordem, ativo, github_url, preco_avulso_centavos, aula_duracao_s, destaques, qtd_skills, qtd_agentes, qtd_prompts)
  on loja_produtos to anon, authenticated;

-- A função antiga de revogar foi substituída por loja_estornar_pagamento
drop function if exists loja_revogar_pedido(uuid);

-- Funções do servidor (só service_role executa) ---------------------------------------

-- Cria o pedido e os itens na mesma transação. Reaproveita o pendente igual (duplo clique) só se o preço
-- for o mesmo; se o preço mudou, cancela o antigo e cria outro. Devolve id e o valor gravado.
create or replace function loja_criar_pedido(
  p_user uuid, p_oferta text, p_valor_centavos int, p_chave text, p_itens text[]
)
returns table (pedido_id uuid, valor_centavos int, reusado boolean)
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
  v_valor int;
begin
  if coalesce(array_length(p_itens, 1), 0) = 0 then
    raise exception 'pedido sem itens';
  end if;
  -- Serializa pedidos do mesmo usuário e da mesma escolha
  perform pg_advisory_xact_lock(hashtextextended(p_user::text || ':' || p_chave, 0));

  select p.id, p.valor_centavos into v_id, v_valor
    from public.loja_pedidos p
   where p.user_id = p_user and p.chave_itens = p_chave and p.status = 'pendente'
   for update;
  if found then
    if v_valor = p_valor_centavos then
      return query select v_id, v_valor, true;
      return;
    end if;
    update public.loja_pedidos set status = 'cancelado', atualizado_em = now() where id = v_id;
  end if;

  insert into public.loja_pedidos (user_id, oferta_codigo, valor_centavos, chave_itens)
  values (p_user, p_oferta, p_valor_centavos, p_chave)
  returning id into v_id;
  insert into public.loja_pedido_itens (pedido_id, produto_slug)
  select v_id, unnest(p_itens);
  return query select v_id, p_valor_centavos, false;
end;
$$;

-- Liberação atômica e idempotente, chamada depois de consultar o pagamento na API do Mercado Pago
create or replace function loja_liberar_pedido(p_pedido uuid, p_payment_id text, p_valor_centavos int)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_pedido public.loja_pedidos%rowtype;
begin
  select * into v_pedido from public.loja_pedidos where id = p_pedido for update;
  if not found then
    return 'pedido_inexistente';
  end if;
  if p_payment_id = any(v_pedido.pagamentos_estornados) then
    return 'estornado';
  end if;
  if v_pedido.status = 'pago' then
    return case when v_pedido.mp_payment_id = p_payment_id then 'ja_pago' else 'pagamento_duplicado' end;
  end if;
  if v_pedido.status = 'reembolsado' then
    return 'reembolsado';
  end if;
  if v_pedido.valor_centavos <> p_valor_centavos then
    return 'valor_divergente';
  end if;

  update public.loja_pedidos
     set status = 'pago', mp_payment_id = p_payment_id, pago_em = now(), atualizado_em = now()
   where id = p_pedido;

  -- Produto que o usuário já tinha mantém o acesso original; acesso revogado volta a valer
  insert into public.loja_acessos (user_id, produto_slug, pedido_id)
  select v_pedido.user_id, i.produto_slug, v_pedido.id
    from public.loja_pedido_itens i
   where i.pedido_id = v_pedido.id
  on conflict (user_id, produto_slug) do update
     set pedido_id = excluded.pedido_id, revogado_em = null, criado_em = now()
   where public.loja_acessos.revogado_em is not null;

  return 'liberado';
end;
$$;

-- Estorno ou chargeback de um pagamento. Se foi o pagamento que liberou o pedido, revoga os acessos
-- que não estejam cobertos por outra compra paga. Se o pedido não estava pago por esse pagamento,
-- só registra o estorno, para que uma aprovação atrasada dele nunca libere.
create or replace function loja_estornar_pagamento(p_pedido uuid, p_payment_id text)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_pedido public.loja_pedidos%rowtype;
begin
  select * into v_pedido from public.loja_pedidos where id = p_pedido for update;
  if not found then
    return 'pedido_inexistente';
  end if;

  if v_pedido.status <> 'pago' or v_pedido.mp_payment_id is distinct from p_payment_id then
    update public.loja_pedidos
       set pagamentos_estornados = array_append(pagamentos_estornados, p_payment_id), atualizado_em = now()
     where id = p_pedido and not (p_payment_id = any(pagamentos_estornados));
    return 'estorno_registrado';
  end if;

  update public.loja_pedidos
     set status = 'reembolsado', atualizado_em = now(),
         pagamentos_estornados = array_append(pagamentos_estornados, p_payment_id)
   where id = p_pedido;

  -- Acesso coberto por outro pedido pago do mesmo usuário passa para esse pedido em vez de cair
  update public.loja_acessos a
     set pedido_id = (
       select p.id from public.loja_pedidos p
         join public.loja_pedido_itens i on i.pedido_id = p.id
        where p.user_id = a.user_id and p.status = 'pago' and p.id <> p_pedido and i.produto_slug = a.produto_slug
        order by p.pago_em
        limit 1
     )
   where a.pedido_id = p_pedido and a.revogado_em is null
     and exists (
       select 1 from public.loja_pedidos p
         join public.loja_pedido_itens i on i.pedido_id = p.id
        where p.user_id = a.user_id and p.status = 'pago' and p.id <> p_pedido and i.produto_slug = a.produto_slug
     );

  update public.loja_acessos set revogado_em = now()
   where pedido_id = p_pedido and revogado_em is null;
  return 'revogado';
end;
$$;

revoke all on function loja_criar_pedido(uuid, text, int, text, text[]) from public, anon, authenticated;
revoke all on function loja_liberar_pedido(uuid, text, int) from public, anon, authenticated;
revoke all on function loja_estornar_pagamento(uuid, text) from public, anon, authenticated;
grant execute on function loja_criar_pedido(uuid, text, int, text, text[]) to service_role;
grant execute on function loja_liberar_pedido(uuid, text, int) to service_role;
grant execute on function loja_estornar_pagamento(uuid, text) to service_role;

-- Preços ------------------------------------------------------------------------------
-- Sai o pacote de vídeo de R$ 97. Se algum pedido já usou a oferta, ela só fica desativada.
delete from loja_oferta_itens where oferta_codigo = 'video';
update loja_ofertas set ativo = false where codigo = 'video';
delete from loja_ofertas o where o.codigo = 'video'
  and not exists (select 1 from loja_pedidos p where p.oferta_codigo = 'video');

update loja_ofertas set preco_centavos = 3700, ordem = 1, ativo = true where codigo = 'avulso';
update loja_ofertas set preco_centavos = 6700, ordem = 2, ativo = true where codigo = 'leve-3';
update loja_ofertas set preco_centavos = 12700, ordem = 3, ativo = true where codigo = 'combo';

-- Edição de vídeo avulso: R$ 47. Os outros usam o avulso da oferta (R$ 37).
update loja_produtos
   set preco_avulso_centavos = 4700,
       resumo = 'Tudo sobre edição de vídeo: corte, legenda e montagem de Reels, Shorts e aulas pedindo em português.'
 where slug = 'edicao-de-video';
update loja_produtos set preco_avulso_centavos = null where slug <> 'edicao-de-video';

-- Oferta de cliente, desativada (sem desconto por enquanto)
insert into loja_ofertas (codigo, titulo, descricao, tipo, qtd_escolha, preco_centavos, exige_cliente, ordem, ativo) values
  ('cliente', 'Preço de cliente', 'Mais um pacote com desconto para quem já é cliente.', 'escolha', 1, 3700, true, 5, false)
on conflict (codigo) do nothing;
