-- Schema inicial: jogadores, futs (partidas) e participações (stats por jogador/fut)

create type posicao_jogador as enum ('goleiro', 'zagueiro', 'meio', 'atacante');
create type cor_time as enum ('branco', 'preto');

create table jogador (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  apelido text,
  numero int,
  foto_url text,
  posicao posicao_jogador,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table fut (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  placar_branco int not null default 0,
  placar_preto int not null default 0,
  criado_em timestamptz not null default now()
);

create table participacao (
  id uuid primary key default gen_random_uuid(),
  fut_id uuid not null references fut (id) on delete cascade,
  jogador_id uuid not null references jogador (id) on delete restrict,
  cor_time cor_time,
  gols int not null default 0,
  assistencias int not null default 0,
  presente boolean not null default true,
  unique (fut_id, jogador_id)
);

create index idx_participacao_fut_id on participacao (fut_id);
create index idx_participacao_jogador_id on participacao (jogador_id);
