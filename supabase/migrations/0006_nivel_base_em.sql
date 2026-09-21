-- Quando o nível foi escolhido na mão pela última vez. Só os futs cadastrados depois disso
-- mexem no nível; trocar o nível no cadastro zera essa conta.
alter table jogador add column nivel_base_em timestamptz not null default now();

-- Quem já está no elenco conta todos os futs que já foram cadastrados
update jogador set nivel_base_em = 'epoch';
