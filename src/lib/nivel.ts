import type { Posicao } from "./jogador";

// Critérios do nível das cartinhas e da seleção do fut. Ficam em código pra dar pra ajustar à vontade.

const NORMAL = 1;
const ALTO = 2;

type Pesos = { gol: number; assistencia: number; defesa: number };

export const PESOS: Record<Posicao, Pesos> = {
  goleiro: { gol: NORMAL, assistencia: NORMAL, defesa: ALTO },
  zagueiro: { gol: NORMAL, assistencia: NORMAL, defesa: ALTO },
  meio: { gol: ALTO, assistencia: ALTO, defesa: NORMAL },
  atacante: { gol: ALTO, assistencia: ALTO, defesa: NORMAL },
};

const PESOS_SEM_POSICAO: Pesos = { gol: NORMAL, assistencia: NORMAL, defesa: NORMAL };

export function pesosDa(posicao: Posicao | null): Pesos {
  return posicao ? PESOS[posicao] : PESOS_SEM_POSICAO;
}

export const NIVEL_MIN = 60;
export const NIVEL_MAX = 95;
// Onde começa quem ainda não jogou (e pra onde puxa quem jogou pouco)
export const NIVEL_BASE = 65;
// Quanto cada ponto de nota média por fut vale em nível
const NIVEL_POR_PONTO = 5;
// Com poucos jogos o nível fica perto da base: com 3 jogos conta metade, com 9 conta 75%
const JOGOS_PRA_CONFIAR = 3;

export type Desempenho = {
  gols: number;
  assistencias: number;
  // Gols feitos pelo time menos gols sofridos (somado em todos os futs, se for o caso)
  saldo: number;
};

// Pontos de um jogador em um fut (ou somados em vários).
// Gols e assistências só somam. A defesa entra como metade do saldo, que é quanto o time
// sofreu a menos (ou a mais) que a média do fut: segurar o placar sobe, tomar muito gol desce.
export function nota(d: Desempenho, posicao: Posicao | null) {
  const pesos = pesosDa(posicao);
  return (
    d.gols * pesos.gol +
    d.assistencias * pesos.assistencia +
    (d.saldo / 2) * pesos.defesa
  );
}

export function nivel(d: Desempenho & { jogos: number }, posicao: Posicao | null) {
  if (d.jogos === 0) return NIVEL_BASE;
  const media = nota(d, posicao) / d.jogos;
  const confianca = d.jogos / (d.jogos + JOGOS_PRA_CONFIAR);
  const bruto = NIVEL_BASE + media * NIVEL_POR_PONTO * confianca;
  return Math.round(Math.min(NIVEL_MAX, Math.max(NIVEL_MIN, bruto)));
}

export type Raridade = "bronze" | "prata" | "ouro";

export function raridade(nivel: number): Raridade {
  if (nivel >= 80) return "ouro";
  if (nivel >= 70) return "prata";
  return "bronze";
}
