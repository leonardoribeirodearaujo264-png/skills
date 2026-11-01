-- 0012: preço cheio do pacote, mostrado riscado ("de R$ 197 por R$ 47") na página de venda.
-- Decisão do dono em 01/11/2026: o preço cheio do pacote de edição de vídeo é R$ 197 e o de venda continua R$ 47.
-- O preço cheio precisa ser o preço que vale fora da promoção (Código de Defesa do Consumidor, art. 37).
-- Fica no próprio produto (fonte única); null = o pacote não mostra preço riscado. Pode rodar mais de uma vez.

alter table loja_produtos add column if not exists preco_cheio_centavos int;
alter table loja_produtos drop constraint if exists preco_cheio_faixa;
alter table loja_produtos add constraint preco_cheio_faixa
  check (preco_cheio_centavos is null or preco_cheio_centavos between 100 and 10000000);

grant select (preco_cheio_centavos) on loja_produtos to anon, authenticated;

update loja_produtos
   set preco_cheio_centavos = 19700
 where slug = 'edicao-de-video';
