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

export const NIVEL_MIN = 70;
export const NIVEL_MAX = 95;
// Sugestão do formulário pra quem ainda não tem nível escolhido
export const NIVEL_PADRAO = 70;
// O nível é escolhido na mão; cada fut depois disso sobe ou desce um pouquinho em cima dele.
// Num fut dá pra cair no máximo QUEDA_MAX...
const QUEDA_MAX = 2;
// ...e subir no máximo GANHO_MAX, mas só pra quem está lá embaixo: subir fica exponencialmente
// mais difícil, o ganho máximo cai pela metade a cada MEIA_VIDA níveis acima do mínimo.
// Com 70 dá pra ganhar 2 num fut, com 78 só 1, com 86 meio ponto, e por aí vai.
const GANHO_MAX = 2;
const MEIA_VIDA = 8;
// Quanto cada ponto de nota acima (ou abaixo) da média do grupo no fut vale em nível
const NIVEL_POR_PONTO = 1;

// Cada jogador é comparado com quem joga parecido. Goleiro e zagueiro ficam juntos
// (e meia com atacante) porque tem pouco goleiro no grupo pra comparar só entre eles.
export type Grupo = "defesa" | "ataque" | "todos";

export function grupoDa(posicao: Posicao | null): Grupo {
  if (posicao === "goleiro" || posicao === "zagueiro") return "defesa";
  if (posicao === "meio" || posicao === "atacante") return "ataque";
  return "todos";
}

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

// Teto do que um fut pode somar pra quem está nesse nível
export function ganhoMaximo(nivelAtual: number) {
  return GANHO_MAX * 0.5 ** ((nivelAtual - NIVEL_MIN) / MEIA_VIDA);
}

// Atuação de alguém num fut, com a nota já calculada
export type AtuacaoNoFut = { jogadorId: string; futId: string; grupo: Grupo; pontos: number };

// Quanto cada atuação mexe no nível: nota acima da média do grupo no mesmo fut sobe, abaixo desce.
// Gols e assistências só aumentam a nota; o que derruba é produzir menos que o grupo ou o time
// tomar muito gol. Se o grupo tem uma pessoa só naquele fut, compara com todo mundo.
export function variacoesPorFut(atuacoes: AtuacaoNoFut[]): Map<AtuacaoNoFut, number> {
  const porFut = Map.groupBy(atuacoes, (a) => a.futId);
  const variacoes = new Map<AtuacaoNoFut, number>();
  for (const doFut of porFut.values()) {
    const media = (lista: AtuacaoNoFut[]) =>
      lista.reduce((soma, a) => soma + a.pontos, 0) / lista.length;
    const mediaGeral = media(doFut);
    for (const a of doFut) {
      const grupo = doFut.filter((b) => b.grupo === a.grupo);
      const referencia = a.grupo !== "todos" && grupo.length > 1 ? media(grupo) : mediaGeral;
      variacoes.set(a, (a.pontos - referencia) * NIVEL_POR_PONTO);
    }
  }
  return variacoes;
}

// Nível escolhido + o que cada fut jogado depois disso deu, em ordem. Cada fut mexe no máximo
// QUEDA_MAX pra baixo e ganhoMaximo() pra cima, sempre a partir do nível daquele momento.
export function nivel(nivelBase: number, variacoes: number[]) {
  let atual = nivelBase;
  for (const v of variacoes) {
    const limitada = Math.min(ganhoMaximo(atual), Math.max(-QUEDA_MAX, v));
    atual = Math.min(NIVEL_MAX, Math.max(NIVEL_MIN, atual + limitada));
  }
  return Math.round(atual);
}

export type Raridade = "bronze" | "prata" | "ouro";

export function raridade(nivel: number): Raridade {
  if (nivel >= 80) return "ouro";
  if (nivel >= 76) return "prata";
  return "bronze";
}
