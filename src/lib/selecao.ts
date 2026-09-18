// Critérios da seleção do fut. Ficam em código (e não no banco) pra dar pra ajustar à vontade.
export const PONTOS = { gol: 3, assistencia: 2, vitoria: 1 } as const;

export const TAMANHO_SELECAO = 5;

export type CorTime = "branco" | "preto";

export type Atuacao = {
  jogadorId: string;
  nome: string;
  corTime: CorTime;
  gols: number;
  assistencias: number;
};

export type AtuacaoPontuada<T extends Atuacao = Atuacao> = T & { pontos: number };

export function vencedor(placarBranco: number, placarPreto: number): CorTime | null {
  if (placarBranco === placarPreto) return null;
  return placarBranco > placarPreto ? "branco" : "preto";
}

export function pontuar<T extends Atuacao>(atuacao: T, venceu: CorTime | null): AtuacaoPontuada<T> {
  const pontos =
    atuacao.gols * PONTOS.gol +
    atuacao.assistencias * PONTOS.assistencia +
    (atuacao.corTime === venceu ? PONTOS.vitoria : 0);
  return { ...atuacao, pontos };
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

// Só entra quem participou de algum gol: vitória sozinha não basta pra ir pra seleção.
// O primeiro da lista é o craque do fut.
export function selecaoDoFut<T extends Atuacao>(
  atuacoes: T[],
  placarBranco: number,
  placarPreto: number,
): AtuacaoPontuada<T>[] {
  const venceu = vencedor(placarBranco, placarPreto);
  return atuacoes
    .filter((a) => a.gols + a.assistencias > 0)
    .map((a) => pontuar(a, venceu))
    .sort(compararAtuacoes)
    .slice(0, TAMANHO_SELECAO);
}
