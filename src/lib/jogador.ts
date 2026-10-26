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

// Ordem do campo: GOL, ZAG, MEI, ATA; quem tá sem posição fecha a lista. Empate vai pelo nome.
export function porPosicao(
  a: { nome: string; posicao: Posicao | null },
  b: { nome: string; posicao: Posicao | null },
) {
  const ordem = (p: Posicao | null) => (p ? POSICOES.indexOf(p) : POSICOES.length);
  return ordem(a.posicao) - ordem(b.posicao) || a.nome.localeCompare(b.nome, "pt-BR");
}

// "jose" acha "José": acento e caixa não atrapalham a busca
export const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}
