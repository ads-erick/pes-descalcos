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
// Sugestão do formulário pra quem ainda não tem nível escolhido
export const NIVEL_PADRAO = 70;
// Quanto as estatísticas podem mexer no nível escolhido, pra cima ou pra baixo
const VARIACAO_MAX = 10;
// Quanto cada ponto de nota por fut acima (ou abaixo) da média do grupo vale em nível
const NIVEL_POR_PONTO = 5;
// Com poucos jogos o nível fica perto do escolhido: com 3 jogos conta metade, com 9 conta 75%
const JOGOS_PRA_CONFIAR = 3;

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

export type Estatisticas = Desempenho & { jogos: number; posicao: Posicao | null };

// Nota média por fut de cada grupo, pra saber o que é jogar "na média"
export function mediasPorGrupo(jogadores: Estatisticas[]): Record<Grupo, number> {
  const soma = { defesa: 0, ataque: 0, todos: 0 };
  const jogos = { defesa: 0, ataque: 0, todos: 0 };
  for (const j of jogadores) {
    const pontos = nota(j, j.posicao);
    for (const grupo of new Set([grupoDa(j.posicao), "todos" as const])) {
      soma[grupo] += pontos;
      jogos[grupo] += j.jogos;
    }
  }
  const media = (g: Grupo) => (jogos[g] ? soma[g] / jogos[g] : 0);
  return { defesa: media("defesa"), ataque: media("ataque"), todos: media("todos") };
}

// Nível escolhido no cadastro + até 10 pontos pelas estatísticas: jogar acima da média do grupo
// sobe, abaixo desce. Gols e assistências só aumentam a nota; o que derruba é produzir menos que
// o grupo ou o time tomar muito gol.
export function nivel(j: Estatisticas, nivelBase: number, medias: Record<Grupo, number>) {
  if (j.jogos === 0) return nivelBase;
  const acimaDaMedia = nota(j, j.posicao) / j.jogos - medias[grupoDa(j.posicao)];
  const confianca = j.jogos / (j.jogos + JOGOS_PRA_CONFIAR);
  const variacao = acimaDaMedia * NIVEL_POR_PONTO * confianca;
  const limitada = Math.min(VARIACAO_MAX, Math.max(-VARIACAO_MAX, variacao));
  return Math.round(Math.min(NIVEL_MAX, Math.max(NIVEL_MIN, nivelBase + limitada)));
}

export type Raridade = "bronze" | "prata" | "ouro";

export function raridade(nivel: number): Raridade {
  if (nivel >= 80) return "ouro";
  if (nivel >= 70) return "prata";
  return "bronze";
}
