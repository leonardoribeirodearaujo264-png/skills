-- Loja de pacotes de skills e agentes. Rodar uma vez no SQL Editor do Supabase.
-- Tabelas separadas da automação de DM (prefixo loja_). Integridade por constraint, não por código.
-- Leitura do usuário só por RLS; toda escrita é do servidor com a service_role.

create extension if not exists pgcrypto;

-- Catálogo ---------------------------------------------------------------------
create table loja_produtos (
  slug           text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  titulo         text not null check (length(titulo) between 1 and 120),
  resumo         text not null check (length(resumo) between 1 and 300),
  ordem          int  not null default 0,
  ativo          boolean not null default true,
  github_url     text check (github_url is null or github_url ~ '^https://github\.com/'),
  -- preço do produto na oferta avulsa; vazio usa o preço da oferta avulso
  preco_avulso_centavos int check (preco_avulso_centavos is null or preco_avulso_centavos between 100 and 10000000),
  aula_arquivo   text,           -- caminho no bucket loja-aulas
  aula_legenda   text,           -- caminho do .vtt no bucket loja-aulas
  zip_arquivo    text,           -- caminho no bucket loja-pacotes
  aula_duracao_s int check (aula_duracao_s is null or aula_duracao_s between 1 and 60),
  -- preenchidos pelo script de publicação a partir de pacotes/<slug>/
  destaques      text[] not null default '{}',
  qtd_skills     int not null default 0,
  qtd_agentes    int not null default 0,
  qtd_prompts    int not null default 0,
  criado_em      timestamptz not null default now()
);

-- tipo: escolha = o cliente escolhe qtd_escolha produtos; fixa = itens em loja_oferta_itens; todos = todos os ativos
create table loja_ofertas (
  codigo          text primary key check (codigo ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  titulo          text not null check (length(titulo) between 1 and 120),
  descricao       text not null check (length(descricao) between 1 and 300),
  tipo            text not null check (tipo in ('escolha', 'fixa', 'todos')),
  qtd_escolha     int  check (qtd_escolha is null or qtd_escolha between 1 and 20),
  preco_centavos  int  not null check (preco_centavos between 100 and 10000000),
  -- oferta só para quem já tem pelo menos um produto (desconto de cliente), conferida no servidor
  exige_cliente   boolean not null default false,
  ordem           int  not null default 0,
  ativo           boolean not null default true,
  constraint escolha_exige_qtd check ((tipo = 'escolha') = (qtd_escolha is not null))
);

create table loja_oferta_itens (
  oferta_codigo  text not null references loja_ofertas(codigo) on delete cascade,
  produto_slug   text not null references loja_produtos(slug),
  primary key (oferta_codigo, produto_slug)
);

-- Pedidos e acessos --------------------------------------------------------------
create table loja_pedidos (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  oferta_codigo     text not null references loja_ofertas(codigo),
  -- cópia do preço no momento da compra; a liberação confere contra este valor
  valor_centavos    int  not null check (valor_centavos > 0),
  -- slugs ordenados e separados por vírgula: impede dois pedidos pendentes iguais (duplo clique)
  chave_itens       text not null,
  status            text not null default 'pendente'
                    check (status in ('pendente', 'pago', 'recusado', 'cancelado', 'reembolsado')),
  mp_preference_id  text,
  mp_payment_id     text unique,
  -- pagamentos deste pedido já estornados: nunca liberam, mesmo se a aprovação chegar atrasada
  pagamentos_estornados text[] not null default '{}',
  -- trava do e-mail de acesso: preenchida uma única vez por pedido
  email_acesso_enviado_em timestamptz,
  criado_em         timestamptz not null default now(),
  pago_em           timestamptz,
  atualizado_em     timestamptz not null default now(),
  constraint pago_tem_pagamento check (status <> 'pago' or (mp_payment_id is not null and pago_em is not null))
);
create unique index loja_pedidos_um_pendente on loja_pedidos (user_id, chave_itens) where status = 'pendente';
create index loja_pedidos_user on loja_pedidos (user_id, criado_em desc);
create index loja_pedidos_pendentes on loja_pedidos (criado_em) where status = 'pendente';

create table loja_pedido_itens (
  pedido_id     uuid not null references loja_pedidos(id) on delete cascade,
  produto_slug  text not null references loja_produtos(slug),
  primary key (pedido_id, produto_slug)
);

-- Um acesso por usuário e produto. revogado_em marca reembolso ou chargeback.
create table loja_acessos (
  user_id       uuid not null references auth.users(id) on delete cascade,
  produto_slug  text not null references loja_produtos(slug),
  pedido_id     uuid not null references loja_pedidos(id),
  criado_em     timestamptz not null default now(),
  revogado_em   timestamptz,
  primary key (user_id, produto_slug)
);
create index loja_acessos_pedido on loja_acessos (pedido_id);

-- Conteúdo da área de membros, gerado a partir de pacotes/<slug>/ pelo script de publicação
create table loja_conteudos (
  id            uuid primary key default gen_random_uuid(),
  produto_slug  text not null references loja_produtos(slug) on delete cascade,
  tipo          text not null check (tipo in ('guia', 'prompt', 'roteiro', 'manifesto')),
  chave         text not null check (length(chave) between 1 and 200),
  titulo        text not null check (length(titulo) between 1 and 200),
  corpo         text not null check (length(corpo) <= 200000),
  ordem         int  not null default 0,
  atualizado_em timestamptz not null default now(),
  unique (produto_slug, tipo, chave)
);

-- Registro das notificações recebidas. A API do Mercado Pago é a fonte da verdade; isto é auditoria.
create table loja_eventos_webhook (
  id           bigint generated always as identity primary key,
  request_id   text not null unique,
  tipo         text not null,
  acao         text,
  recurso_id   text not null,
  resultado    text,
  recebido_em  timestamptz not null default now()
);

-- RLS --------------------------------------------------------------------------
alter table loja_produtos        enable row level security;
alter table loja_ofertas         enable row level security;
alter table loja_oferta_itens    enable row level security;
alter table loja_pedidos         enable row level security;
alter table loja_pedido_itens    enable row level security;
alter table loja_acessos         enable row level security;
alter table loja_conteudos       enable row level security;
alter table loja_eventos_webhook enable row level security;

-- Vitrine pública
create policy produtos_vitrine on loja_produtos for select to anon using (ativo);
-- Quem comprou continua vendo o produto mesmo se ele sair da vitrine
create policy produtos_vitrine_ou_comprado on loja_produtos for select to authenticated
  using (ativo or exists (
    select 1 from loja_acessos a
    where a.produto_slug = loja_produtos.slug and a.user_id = (select auth.uid()) and a.revogado_em is null
  ));
-- Caminhos dos arquivos no Storage não saem pela API pública
revoke select on loja_produtos from anon, authenticated;
grant select (slug, titulo, resumo, ordem, ativo, github_url, preco_avulso_centavos, aula_duracao_s, destaques, qtd_skills, qtd_agentes, qtd_prompts)
  on loja_produtos to anon, authenticated;
create policy ofertas_vitrine  on loja_ofertas  for select to anon, authenticated using (ativo);
create policy oferta_itens_vitrine on loja_oferta_itens for select to anon, authenticated using (true);

-- Cada um vê só o que é seu. Sem policy de insert, update ou delete: só o servidor grava.
create policy pedidos_proprios on loja_pedidos for select to authenticated
  using (user_id = (select auth.uid()));
create policy pedido_itens_proprios on loja_pedido_itens for select to authenticated
  using (exists (select 1 from loja_pedidos p where p.id = pedido_id and p.user_id = (select auth.uid())));
create policy acessos_proprios on loja_acessos for select to authenticated
  using (user_id = (select auth.uid()));

-- O conteúdo só aparece para quem tem acesso ativo ao produto
create policy conteudo_com_acesso on loja_conteudos for select to authenticated
  using (exists (
    select 1 from loja_acessos a
    where a.produto_slug = loja_conteudos.produto_slug
      and a.user_id = (select auth.uid())
      and a.revogado_em is null
  ));

-- loja_eventos_webhook: nenhuma policy, só a service_role lê e grava.

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

-- Storage: buckets privados. Sem policy em storage.objects; o servidor entrega por URL assinada.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('loja-aulas',   'loja-aulas',   false, 104857600, array['video/mp4', 'text/vtt']),
  ('loja-pacotes', 'loja-pacotes', false, 52428800,  array['application/zip'])
on conflict (id) do nothing;

-- Dados iniciais -------------------------------------------------------------------
-- Preços e composição são alterados aqui (ou no Table Editor), nunca no código das telas.
insert into loja_produtos (slug, titulo, resumo, ordem, github_url, preco_avulso_centavos) values
  ('design-copy-anuncios', 'Design, copy, anúncios e velocidade',
   'Páginas com cara de produto profissional, texto que vende, anúncios e site rápido.', 1,
   'https://github.com/leonardoribeirodearaujo264-png/skills/tree/main/pacotes/design-copy-anuncios', null),
  ('edicao-de-video', 'Edição de vídeo por skills',
   'Tudo sobre edição de vídeo: corte, legenda e montagem de Reels, Shorts e aulas pedindo em português.', 2,
   'https://github.com/leonardoribeirodearaujo264-png/skills/tree/main/pacotes/edicao-de-video', 4700),
  ('motion-mockup-fontes', 'Motion, mockup e fontes',
   'Animações, mockups de produto e pares de fontes sem programa de design.', 3,
   'https://github.com/leonardoribeirodearaujo264-png/skills/tree/main/pacotes/motion-mockup-fontes', null),
  ('programacao-sem-codigo', 'Programação para quem não programa',
   'Do pedido em português ao projeto no ar, com testes e revisão de segurança.', 4,
   'https://github.com/leonardoribeirodearaujo264-png/skills/tree/main/pacotes/programacao-sem-codigo', null),
  ('times-de-agentes', 'Times de agentes por área do negócio',
   'Marketing, vendas, financeiro, atendimento, operações e conteúdo, cada um com líder e revisor.', 5,
   'https://github.com/leonardoribeirodearaujo264-png/skills/tree/main/pacotes/times-de-agentes', null);

-- Avulso: R$ 37 por padrão; o de edição de vídeo tem preço próprio (R$ 47) em loja_produtos.
-- loja_oferta_itens fica para ofertas de composição fixa (tipo 'fixa'); hoje não há nenhuma.
insert into loja_ofertas (codigo, titulo, descricao, tipo, qtd_escolha, preco_centavos, ordem) values
  ('avulso', 'Avulso', 'Escolha um pacote.', 'escolha', 1, 3700, 1),
  ('leve-3', 'Pague 2, leve 3', 'Escolha três pacotes pelo preço de dois.', 'escolha', 3, 6700, 2),
  ('combo', 'Combo completo', 'Todos os pacotes.', 'todos', null, 12700, 3);

-- Oferta de cliente: mais um pacote com desconto para quem já comprou. Fica DESATIVADA até o dono
-- definir o preço: update loja_ofertas set preco_centavos = <valor>, ativo = true where codigo = 'cliente';
insert into loja_ofertas (codigo, titulo, descricao, tipo, qtd_escolha, preco_centavos, exige_cliente, ordem, ativo) values
  ('cliente', 'Preço de cliente', 'Mais um pacote com desconto para quem já é cliente.', 'escolha', 1, 3700, true, 5, false);
