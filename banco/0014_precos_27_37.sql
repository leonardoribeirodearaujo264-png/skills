-- 0014: novos preços (decisão do dono em 04/11/2026). Pacote de R$ 37 passa a R$ 27 e o de R$ 47 passa a R$ 37.
-- O preço de cliente é calculado em cima do avulso (20%), então acompanha sozinho. Leve 3 e Coleção Completa mantêm o preço.
-- O título "Pague 2, leve 3" deixaria de ser verdade (2 x R$ 27 = R$ 54, a oferta custa R$ 67), então muda junto.
-- Pode rodar mais de uma vez: não depende do valor anterior.

update loja_ofertas set preco_centavos = 2700 where codigo = 'avulso';
update loja_produtos set preco_avulso_centavos = 3700 where slug = 'edicao-de-video';
update loja_ofertas set titulo = 'Leve 3 por R$ 67' where codigo = 'leve-3';
