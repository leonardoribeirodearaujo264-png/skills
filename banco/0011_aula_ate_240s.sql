-- 0011: a aula passo a passo da Edição de vídeo tem cerca de 2 min e meio (decisão do dono em 01/11/2026).
-- Sobe o limite de aula_duracao_s para 240 s. Pode rodar mais de uma vez.

alter table loja_produtos drop constraint if exists loja_produtos_aula_duracao_s_check;
alter table loja_produtos add constraint loja_produtos_aula_duracao_s_check
  check (aula_duracao_s is null or aula_duracao_s between 1 and 240);
