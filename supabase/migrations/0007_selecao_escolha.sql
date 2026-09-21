-- Vagas da seleção do fut escolhidas na mão pelo admin. A vaga é o número dela na
-- formação (0 = goleiro, 1-2 = zagueiros, 3-4 = meias, 5-6 = atacantes); as vagas sem
-- linha aqui continuam saindo da conta.
create table selecao_escolha (
  fut_id uuid not null references fut (id) on delete cascade,
  vaga smallint not null check (vaga between 0 and 6),
  jogador_id uuid not null references jogador (id) on delete cascade,
  primary key (fut_id, vaga),
  unique (fut_id, jogador_id)
);

-- Mesma regra das outras tabelas: sem policies, só o servidor acessa
alter table selecao_escolha enable row level security;
