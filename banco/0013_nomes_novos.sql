-- 0013: nomes novos dos pacotes e da oferta completa (decisão do dono em 04/11/2026).
-- Só muda o título que aparece no site, no checkout, no Mercado Pago e nos e-mails. Os slugs ficam iguais:
-- são a chave de loja_acessos, loja_pedido_itens e do ZIP no Storage. Pode rodar mais de uma vez.

update loja_produtos set titulo = 'Kit Vitrine de Vendas' where slug = 'design-copy-anuncios';
update loja_produtos set titulo = 'Ilha de Edição IA' where slug = 'edicao-de-video';
update loja_produtos set titulo = 'Kit Cena' where slug = 'motion-mockup-fontes';
update loja_produtos set titulo = 'Kit Código Seguro' where slug = 'programacao-sem-codigo';
update loja_produtos set titulo = 'Kit Empresa IA' where slug = 'times-de-agentes';

update loja_ofertas set titulo = 'Coleção Completa' where codigo = 'combo';
