-- Sem policies de propósito: bloqueia acesso via Data API (chave publishable).
-- O app acessa o banco direto pela connection string, que ignora RLS.

alter table jogador enable row level security;
alter table fut enable row level security;
alter table participacao enable row level security;
