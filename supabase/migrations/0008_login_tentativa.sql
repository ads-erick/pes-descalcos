-- Tentativas de login do admin, pra bloquear quem erra a senha várias vezes seguidas
-- (src/data/login-limite.ts). Fica no banco porque na Vercel cada instância tem a
-- própria memória e ela some. O IP não é guardado: a coluna tem um HMAC dele.
create table login_tentativa (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  em timestamptz not null default now()
);

create index login_tentativa_ip_em on login_tentativa (ip_hash, em desc);

-- Mesma regra das outras tabelas: sem policies, só o servidor acessa
alter table login_tentativa enable row level security;
