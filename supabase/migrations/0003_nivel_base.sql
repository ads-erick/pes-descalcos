-- Nível escolhido no cadastro; as estatísticas sobem ou descem a partir dele
alter table jogador
  add column nivel_base int not null default 70
  check (nivel_base between 60 and 95);
