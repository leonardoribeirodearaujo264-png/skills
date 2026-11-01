-- 0011: "Pague 2, leve 3" passa a custar R$ 67 pelos três pacotes (decisão do dono em 01/11/2026),
-- para a escada de preço ficar clara: pacote R$ 37 ou R$ 47, leve 3 R$ 67, combo R$ 97. Pode rodar mais de uma vez.

update loja_ofertas
   set preco_centavos = 6700,
       descricao = 'Escolha três pacotes e leve os três por R$ 67.'
 where codigo = 'leve-3';
