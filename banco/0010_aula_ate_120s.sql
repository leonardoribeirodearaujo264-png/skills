-- 0010: aulas novas com a instalação pelo app do Claude passam de 60 s (decisão do dono em 30/10/2026).
-- Sobe o limite de aula_duracao_s para 120 s. Pode rodar mais de uma vez.

alter table loja_produtos drop constraint if exists loja_produtos_aula_duracao_s_check;
alter table loja_produtos add constraint loja_produtos_aula_duracao_s_check
  check (aula_duracao_s is null or aula_duracao_s between 1 and 120);
