-- Nível base agora vai de 70 a 95 (bronze 70-75, prata 76-79, ouro 80-95)
update jogador set nivel_base = 70 where nivel_base < 70;

alter table jogador drop constraint if exists jogador_nivel_base_check;
alter table jogador
  add constraint jogador_nivel_base_check check (nivel_base between 70 and 95);
