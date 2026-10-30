-- 0004: nome e telefone do comprador no pedido, e renomeia o pacote de times de agentes.
-- Pode rodar mais de uma vez.

alter table loja_pedidos add column if not exists comprador_nome text;
alter table loja_pedidos add column if not exists comprador_telefone text;

alter table loja_pedidos drop constraint if exists comprador_nome_formato;
alter table loja_pedidos add constraint comprador_nome_formato
  check (comprador_nome is null or length(comprador_nome) between 5 and 120);
-- Só números: DDD de 2 dígitos e número de 8 ou 9
alter table loja_pedidos drop constraint if exists comprador_telefone_formato;
alter table loja_pedidos add constraint comprador_telefone_formato
  check (comprador_telefone is null or comprador_telefone ~ '^[1-9][0-9][0-9]{8,9}$');

-- Nome novo do pacote (escolhido pelo dono)
update loja_produtos
   set titulo = 'Equipe Completa de Agentes',
       resumo = '25 agentes por área do negócio, do marketing ao financeiro, cada time com líder e revisor.'
 where slug = 'times-de-agentes';
