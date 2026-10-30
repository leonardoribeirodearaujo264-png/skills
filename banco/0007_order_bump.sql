-- 0007: oferta complementar (order bump) no checkout e o produto Lançamento Pro.
-- O preço do bump fica no próprio produto (fonte única). so_bump = vendido só como complemento:
-- fica fora da vitrine, da loja e do combo "todos". Pode rodar mais de uma vez.

alter table loja_produtos add column if not exists preco_bump_centavos int;
alter table loja_produtos drop constraint if exists preco_bump_faixa;
alter table loja_produtos add constraint preco_bump_faixa
  check (preco_bump_centavos is null or preco_bump_centavos between 100 and 10000000);
alter table loja_produtos add column if not exists so_bump boolean not null default false;

grant select (preco_bump_centavos, so_bump) on loja_produtos to anon, authenticated;

insert into loja_produtos (slug, titulo, resumo, ordem, preco_bump_centavos, so_bump)
values (
  'lancamento-pro',
  'Lançamento Pro',
  '15 agentes e 50 skills para copy, anúncios, página e atendimento de um lançamento.',
  90,
  1990,
  true
)
on conflict (slug) do update
   set titulo = excluded.titulo,
       resumo = excluded.resumo,
       preco_bump_centavos = excluded.preco_bump_centavos,
       so_bump = excluded.so_bump;
