-- Craque do fut escolhido na mão pelo admin. Nulo = vale a conta (o de melhores números
-- da seleção). Só vale se o jogador estiver na seleção do fut: se ele sair (troca de vaga,
-- fut editado), o craque volta pra conta sem precisar mexer aqui.
alter table fut
  add column craque_id uuid references jogador (id) on delete set null;
