-- 0009: mais duas ofertas complementares no checkout (decisão do dono em 30/10/2026). O cliente marca quantas quiser.
-- Edição de vídeo por R$ 27 e Motion, mockup e fontes por R$ 9,90 como complemento; os dois continuam à venda normalmente.
-- Pode rodar mais de uma vez.

update loja_produtos set preco_bump_centavos = 2700 where slug = 'edicao-de-video';
update loja_produtos set preco_bump_centavos = 990 where slug = 'motion-mockup-fontes';
