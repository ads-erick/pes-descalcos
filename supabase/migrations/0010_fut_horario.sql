-- Horário do fut, opcional: quem cadastra o fut antes de rolar pode dizer a que horas é,
-- e ele vai junto no texto dos times pro grupo. Nulo = sem horário (os futs antigos).
alter table fut
  add column horario time;
