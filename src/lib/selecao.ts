import type { Posicao } from "./jogador";
import { nota } from "./nivel";

export const TAMANHO_SELECAO = 5;

export type CorTime = "branco" | "preto";

export type Atuacao = {
  jogadorId: string;
  nome: string;
  posicao: Posicao | null;
  corTime: CorTime;
  gols: number;
  assistencias: number;
};

export type AtuacaoPontuada<T extends Atuacao = Atuacao> = T & { pontos: number };

export function vencedor(placarBranco: number, placarPreto: number): CorTime | null {
  if (placarBranco === placarPreto) return null;
  return placarBranco > placarPreto ? "branco" : "preto";
}

export function saldoDoTime(corTime: CorTime, placarBranco: number, placarPreto: number) {
  return corTime === "branco" ? placarBranco - placarPreto : placarPreto - placarBranco;
}

// Desempate: mais gols, depois mais assistências, depois ordem alfabética (pra ser estável)
function compararAtuacoes(a: AtuacaoPontuada, b: AtuacaoPontuada) {
  return (
    b.pontos - a.pontos ||
    b.gols - a.gols ||
    b.assistencias - a.assistencias ||
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

// Mesma nota do nível das cartinhas, só que de um fut só. Só entra quem pontuou;
// o primeiro da lista é o craque do fut.
export function selecaoDoFut<T extends Atuacao>(
  atuacoes: T[],
  placarBranco: number,
  placarPreto: number,
): AtuacaoPontuada<T>[] {
  return atuacoes
    .map((a) => ({
      ...a,
      pontos: nota({ ...a, saldo: saldoDoTime(a.corTime, placarBranco, placarPreto) }, a.posicao),
    }))
    .filter((a) => a.pontos > 0)
    .sort(compararAtuacoes)
    .slice(0, TAMANHO_SELECAO);
}

export function formatarPontos(pontos: number) {
  return pontos.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}
