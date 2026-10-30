-- 0003: compra sem login e desconto de cliente. Rodar depois do 0001 (e do 0002, se ele foi usado).
-- Pode rodar mais de uma vez.
-- O pedido passa a nascer com o e-mail do comprador; a conta é criada ou encontrada pelo e-mail
-- quando o pagamento é aprovado, e só então o acesso é liberado.

-- Pedido ligado ao e-mail -----------------------------------------------------------
alter table loja_pedidos alter column user_id drop not null;
alter table loja_pedidos add column if not exists comprador_email text;

-- Pedidos antigos herdam o e-mail da conta
update loja_pedidos p
   set comprador_email = lower(u.email)
  from auth.users u
 where p.user_id = u.id and p.comprador_email is null;

alter table loja_pedidos drop constraint if exists comprador_email_formato;
alter table loja_pedidos add constraint comprador_email_formato
  check (comprador_email is not null
         and comprador_email = lower(comprador_email)
         and comprador_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
         and length(comprador_email) <= 254);
alter table loja_pedidos drop constraint if exists pago_tem_usuario;
alter table loja_pedidos add constraint pago_tem_usuario check (status <> 'pago' or user_id is not null);

-- Duplo clique: um pendente igual por e-mail (antes era por conta)
drop index if exists loja_pedidos_um_pendente;
create unique index if not exists loja_pedidos_um_pendente_email
  on loja_pedidos (comprador_email, chave_itens) where status = 'pendente';
create index if not exists loja_pedidos_email on loja_pedidos (comprador_email);

-- Desconto de cliente em percentual, sobre o preço avulso de cada produto ------------------
alter table loja_ofertas add column if not exists desconto_percentual int
  check (desconto_percentual is null or desconto_percentual between 1 and 90);
-- Na oferta de cliente o preço vem do produto com o desconto; preco_centavos não é usado nela
update loja_ofertas set desconto_percentual = 20, ativo = true where codigo = 'cliente';

-- Funções do servidor (só service_role executa) -----------------------------------------

-- Conta pelo e-mail, para ligar o pedido aprovado à conta certa
create or replace function loja_usuario_por_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from auth.users where lower(email) = lower(p_email) order by created_at limit 1;
$$;

-- Liga o pedido à conta uma única vez; nunca troca uma conta já ligada
create or replace function loja_vincular_comprador(p_pedido uuid, p_user uuid)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_atual uuid;
begin
  select user_id into v_atual from public.loja_pedidos where id = p_pedido for update;
  if not found then
    return 'pedido_inexistente';
  end if;
  if v_atual is null then
    update public.loja_pedidos set user_id = p_user, atualizado_em = now() where id = p_pedido;
    return 'vinculado';
  end if;
  return case when v_atual = p_user then 'ja_vinculado' else 'outra_conta' end;
end;
$$;

-- Cria o pedido pelo e-mail (com ou sem conta), com os itens na mesma transação.
-- Reaproveita o pendente igual só se o preço for o mesmo.
drop function if exists loja_criar_pedido(uuid, text, int, text, text[]);
create or replace function loja_criar_pedido(
  p_email text, p_user uuid, p_oferta text, p_valor_centavos int, p_chave text, p_itens text[]
)
returns table (pedido_id uuid, valor_centavos int, reusado boolean)
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
  v_valor int;
  v_email text := lower(p_email);
begin
  if coalesce(array_length(p_itens, 1), 0) = 0 then
    raise exception 'pedido sem itens';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_email || ':' || p_chave, 0));

  select p.id, p.valor_centavos into v_id, v_valor
    from public.loja_pedidos p
   where p.comprador_email = v_email and p.chave_itens = p_chave and p.status = 'pendente'
   for update;
  if found then
    if v_valor = p_valor_centavos then
      return query select v_id, v_valor, true;
      return;
    end if;
    update public.loja_pedidos set status = 'cancelado', atualizado_em = now() where id = v_id;
  end if;

  insert into public.loja_pedidos (comprador_email, user_id, oferta_codigo, valor_centavos, chave_itens)
  values (v_email, p_user, p_oferta, p_valor_centavos, p_chave)
  returning id into v_id;
  insert into public.loja_pedido_itens (pedido_id, produto_slug)
  select v_id, unnest(p_itens);
  return query select v_id, p_valor_centavos, false;
end;
$$;

-- Liberação: igual à anterior, mas exige a conta já ligada ao pedido
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
  if v_pedido.user_id is null then
    return 'sem_conta';
  end if;

  update public.loja_pedidos
     set status = 'pago', mp_payment_id = p_payment_id, pago_em = now(), atualizado_em = now()
   where id = p_pedido;

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

-- Limite de envio do código de login: 1 por minuto e 6 por hora por e-mail
create table if not exists loja_envios_acesso (
  id         bigint generated always as identity primary key,
  email      text not null,
  enviado_em timestamptz not null default now()
);
create index if not exists loja_envios_acesso_email on loja_envios_acesso (email, enviado_em desc);
alter table loja_envios_acesso enable row level security;

create or replace function loja_registrar_envio_acesso(p_email text)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_email text := lower(p_email);
begin
  perform pg_advisory_xact_lock(hashtextextended('envio:' || v_email, 0));
  if exists (select 1 from public.loja_envios_acesso where email = v_email and enviado_em > now() - interval '1 minute')
     or (select count(*) from public.loja_envios_acesso where email = v_email and enviado_em > now() - interval '1 hour') >= 6 then
    return false;
  end if;
  insert into public.loja_envios_acesso (email) values (v_email);
  delete from public.loja_envios_acesso where enviado_em < now() - interval '2 days';
  return true;
end;
$$;

revoke all on function loja_registrar_envio_acesso(text) from public, anon, authenticated;
grant execute on function loja_registrar_envio_acesso(text) to service_role;

revoke all on function loja_usuario_por_email(text) from public, anon, authenticated;
revoke all on function loja_vincular_comprador(uuid, uuid) from public, anon, authenticated;
revoke all on function loja_criar_pedido(text, uuid, text, int, text, text[]) from public, anon, authenticated;
revoke all on function loja_liberar_pedido(uuid, text, int) from public, anon, authenticated;
grant execute on function loja_usuario_por_email(text) to service_role;
grant execute on function loja_vincular_comprador(uuid, uuid) to service_role;
grant execute on function loja_criar_pedido(text, uuid, text, int, text, text[]) to service_role;
grant execute on function loja_liberar_pedido(uuid, text, int) to service_role;
