-- O nível passa a ser só o que o admin escolhe (nivel_base): os futs não mexem mais nele.
-- A carta compara com o nível de antes da última troca, guardado aqui. Nulo = nunca foi trocado.
alter table jogador add column nivel_anterior smallint;

alter table jogador drop column nivel_base_em;
