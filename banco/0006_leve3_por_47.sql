-- 0006: "Pague 2, leve 3" passa a custar R$ 47 pelos três pacotes (decisão do dono em 30/10/2026).
-- O texto antigo ("pelo preço de dois") deixa de valer com esse preço. Pode rodar mais de uma vez.

update loja_ofertas
   set preco_centavos = 4700,
       descricao = 'Escolha três pacotes e leve os três por R$ 47.'
 where codigo = 'leve-3';
