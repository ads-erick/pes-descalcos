// Nível das cartinhas: escolhido na mão pelo admin. A carta mostra se subiu ou desceu em relação ao anterior.

export const NIVEL_MIN = 70;
export const NIVEL_MAX = 95;
// Sugestão do formulário pra quem ainda não tem nível escolhido
export const NIVEL_PADRAO = 70;

export type Raridade = "bronze" | "prata" | "ouro";

export function raridade(nivel: number): Raridade {
  if (nivel >= 80) return "ouro";
  if (nivel >= 76) return "prata";
  return "bronze";
}
