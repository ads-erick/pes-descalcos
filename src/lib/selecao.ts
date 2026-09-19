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

// Formação da seleção no campo de fut7: 1 goleiro, 2 zagueiros, 2 meias e 2 atacantes
export const FORMACAO: { posicao: Posicao; vagas: number }[] = [
  { posicao: "goleiro", vagas: 1 },
  { posicao: "zagueiro", vagas: 2 },
  { posicao: "meio", vagas: 2 },
  { posicao: "atacante", vagas: 2 },
];

export type Vaga<T extends Atuacao> = { posicao: Posicao; atuacao: AtuacaoPontuada<T> | null };

// Os melhores de cada posição pela nota do fut. Se faltar gente numa posição
// (ninguém jogou de goleiro, só um zagueiro...), a vaga fica com o melhor que sobrou,
// de qualquer posição; só fica vazia se não tiver mais ninguém.
export function escalarSelecao<T extends Atuacao>(
  atuacoes: T[],
  placarBranco: number,
  placarPreto: number,
): Vaga<T>[] {
  const ranking = atuacoes
    .map((a) => ({
      ...a,
      pontos: nota({ ...a, saldo: saldoDoTime(a.corTime, placarBranco, placarPreto) }, a.posicao),
    }))
    .sort(compararAtuacoes);

  const escolhidos = new Set<string>();
  const vagas: Vaga<T>[] = FORMACAO.flatMap(({ posicao, vagas }) => {
    const daPosicao = ranking.filter((a) => a.posicao === posicao).slice(0, vagas);
    daPosicao.forEach((a) => escolhidos.add(a.jogadorId));
    return Array.from({ length: vagas }, (_, i) => ({ posicao, atuacao: daPosicao[i] ?? null }));
  });

  for (const vaga of vagas) {
    if (vaga.atuacao) continue;
    const melhorQueSobrou = ranking.find((a) => !escolhidos.has(a.jogadorId));
    if (!melhorQueSobrou) break;
    escolhidos.add(melhorQueSobrou.jogadorId);
    vaga.atuacao = melhorQueSobrou;
  }

  return vagas;
}
