export const POSICOES = ["goleiro", "zagueiro", "meio", "atacante"] as const;

export type Posicao = (typeof POSICOES)[number];

export const POSICAO_LABEL: Record<Posicao, string> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  meio: "Meio-campo",
  atacante: "Atacante",
};

export const POSICAO_SIGLA: Record<Posicao, string> = {
  goleiro: "GOL",
  zagueiro: "ZAG",
  meio: "MEI",
  atacante: "ATA",
};

export function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}
