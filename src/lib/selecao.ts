import type { Posicao } from "./jogador";

export const TAMANHO_SELECAO = 5;

export type CorTime = "branco" | "preto";

export const NOME_TIME: Record<CorTime, string> = {
  branco: "Time branco",
  preto: "Time preto",
};

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

// Quem teve os melhores números no fut, do melhor pro pior. A nota da seleção é
// gols + assistências, e só: o saldo do time (que pesa no nível das cartinhas) fica de
// fora, senão quem fez 1 gol no time que ganhou de lavada passava na frente de quem fez
// 2 gols e 1 assistência no que perdeu.
// Desempate: mais gols, depois o time que foi melhor no placar (é o que separa goleiros
// e zagueiros, que quase nunca marcam), depois ordem alfabética (pra ser estável)
export function rankingDoFut<T extends Atuacao>(
  atuacoes: T[],
  placarBranco: number,
  placarPreto: number,
): AtuacaoPontuada<T>[] {
  const saldo = (a: Atuacao) => saldoDoTime(a.corTime, placarBranco, placarPreto);
  return atuacoes
    .map((a) => ({ ...a, pontos: a.gols + a.assistencias }))
    .sort(
      (a, b) =>
        b.pontos - a.pontos ||
        b.gols - a.gols ||
        saldo(b) - saldo(a) ||
        a.nome.localeCompare(b.nome, "pt-BR"),
    );
}

// Só entra quem fez gol ou deu assistência; o primeiro da lista é o craque do fut.
export function selecaoDoFut<T extends Atuacao>(
  atuacoes: T[],
  placarBranco: number,
  placarPreto: number,
): AtuacaoPontuada<T>[] {
  return rankingDoFut(atuacoes, placarBranco, placarPreto)
    .filter((a) => a.pontos > 0)
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

export type Vaga<T extends Atuacao> = {
  posicao: Posicao;
  atuacao: AtuacaoPontuada<T> | null;
  // Escolhido na mão pelo admin, em vez da conta
  manual: boolean;
};

// Número de cada vaga, na ordem da FORMACAO (0 = goleiro, 1 e 2 = zagueiros...)
export const TOTAL_VAGAS = FORMACAO.reduce((total, f) => total + f.vagas, 0);

// Os melhores de cada posição pelos números do fut. Se faltar gente numa posição
// (ninguém jogou de goleiro, só um zagueiro...), a vaga fica com o melhor que sobrou,
// de qualquer posição; só fica vazia se não tiver mais ninguém.
// As vagas escolhidas na mão (número da vaga → jogador) valem antes da conta, e quem
// foi escolhido não aparece de novo em outra vaga. Escolha de quem não jogou o fut
// (o fut foi editado depois) é ignorada.
export function escalarSelecao<T extends Atuacao>(
  atuacoes: T[],
  placarBranco: number,
  placarPreto: number,
  escolhas: ReadonlyMap<number, string> = new Map(),
): Vaga<T>[] {
  const ranking = rankingDoFut(atuacoes, placarBranco, placarPreto);
  const porId = new Map(ranking.map((a) => [a.jogadorId, a]));

  const vagas: Vaga<T>[] = FORMACAO.flatMap(({ posicao, vagas }) =>
    Array.from({ length: vagas }, () => ({ posicao, atuacao: null, manual: false })),
  );

  const escolhidos = new Set<string>();
  vagas.forEach((vaga, i) => {
    const escolhido = porId.get(escolhas.get(i) ?? "");
    if (!escolhido || escolhidos.has(escolhido.jogadorId)) return;
    escolhidos.add(escolhido.jogadorId);
    vaga.atuacao = escolhido;
    vaga.manual = true;
  });

  // Primeiro cada vaga livre com o melhor da posição dela...
  for (const vaga of vagas) {
    if (vaga.atuacao) continue;
    const melhor = ranking.find((a) => a.posicao === vaga.posicao && !escolhidos.has(a.jogadorId));
    if (!melhor) continue;
    escolhidos.add(melhor.jogadorId);
    vaga.atuacao = melhor;
  }

  // ...e o que sobrou vazio fica com o melhor de qualquer posição
  for (const vaga of vagas) {
    if (vaga.atuacao) continue;
    const melhorQueSobrou = ranking.find((a) => !escolhidos.has(a.jogadorId));
    if (!melhorQueSobrou) break;
    escolhidos.add(melhorQueSobrou.jogadorId);
    vaga.atuacao = melhorQueSobrou;
  }

  return vagas;
}
