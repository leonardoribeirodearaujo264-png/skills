-- 0005: a Equipe Completa de Agentes passa a ser o primeiro pacote da vitrine.
-- O catálogo da página inicial destaca o primeiro pela ordem; a loja e o combo seguem a mesma ordem.
-- Pode rodar mais de uma vez.

update loja_produtos set ordem = 0 where slug = 'times-de-agentes';
