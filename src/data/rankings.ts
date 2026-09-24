import "server-only";
import { connection } from "next/server";
import { sql } from "./db";
import { buscarEscolhasDeTodos } from "./selecao";
import type { Posicao } from "@/lib/jogador";
import { inicioDoPeriodo, type Periodo } from "@/lib/ranking";
import { craqueDoFut, escalarSelecao, type Atuacao } from "@/lib/selecao";

export type EstatisticaDoPeriodo = {
  jogadorId: string;
  nome: string;
  posicao: Posicao | null;
  jogos: number;
  gols: number;
  assistencias: number;
  vitorias: number;
  selecoes: number;
  craques: number;
};

export type Rankings = {
  futs: number;
  jogadores: EstatisticaDoPeriodo[];
};

type AtuacaoDoFut = Atuacao & {
  futId: string;
  placarBranco: number;
  placarPreto: number;
  craqueId: string | null;
};

// A seleção (com as trocas na mão) e o craque (com a escolha do admin) saem de cada fut:
// dá pra contar só refazendo a conta fut a fut
function contarSelecoes(
  atuacoes: AtuacaoDoFut[],
  escolhas: Map<string, Map<number, string>>,
): { selecoes: Map<string, number>; craques: Map<string, number> } {
  const selecoes = new Map<string, number>();
  const craques = new Map<string, number>();
  const somar = (contagem: Map<string, number>, jogadorId: string) =>
    contagem.set(jogadorId, (contagem.get(jogadorId) ?? 0) + 1);

  for (const [futId, doFut] of Map.groupBy(atuacoes, (a) => a.futId)) {
    const { placarBranco, placarPreto, craqueId } = doFut[0];
    const escolhasDoFut = escolhas.get(futId) ?? new Map();

    for (const vaga of escalarSelecao(doFut, placarBranco, placarPreto, escolhasDoFut)) {
      if (vaga.atuacao) somar(selecoes, vaga.atuacao.jogadorId);
    }

    const craque = craqueDoFut(doFut, placarBranco, placarPreto, escolhasDoFut, craqueId);
    if (craque) somar(craques, craque.atuacao.jogadorId);
  }
  return { selecoes, craques };
}

// Arquivados entram: os gols deles continuam valendo no período em que jogaram
export async function buscarRankings(periodo: Periodo): Promise<Rankings> {
  await connection();
  const desde = inicioDoPeriodo(periodo);

  const [[{ futs }], jogadores, atuacoes, escolhas] = await Promise.all([
    sql<{ futs: number }[]>`
      select count(*)::int as futs
      from fut
      where ${desde}::date is null or data >= ${desde}::date
    `,
    sql<Omit<EstatisticaDoPeriodo, "selecoes" | "craques">[]>`
      select
        j.id as "jogadorId",
        coalesce(j.apelido, j.nome) as nome,
        j.posicao,
        count(p.id) filter (where p.presente)::int as jogos,
        sum(p.gols)::int as gols,
        sum(p.assistencias)::int as assistencias,
        count(p.id) filter (
          where p.presente and p.cor_time::text = case
            when f.placar_branco > f.placar_preto then 'branco'
            when f.placar_preto > f.placar_branco then 'preto'
          end
        )::int as vitorias
      from participacao p
      join fut f on f.id = p.fut_id
      join jogador j on j.id = p.jogador_id
      where ${desde}::date is null or f.data >= ${desde}::date
      group by j.id
    `,
    sql<AtuacaoDoFut[]>`
      select
        p.fut_id as "futId",
        f.placar_branco as "placarBranco",
        f.placar_preto as "placarPreto",
        f.craque_id as "craqueId",
        p.jogador_id as "jogadorId",
        coalesce(j.apelido, j.nome) as nome,
        j.posicao,
        p.cor_time as "corTime",
        p.gols, p.assistencias
      from participacao p
      join fut f on f.id = p.fut_id
      join jogador j on j.id = p.jogador_id
      where ${desde}::date is null or f.data >= ${desde}::date
    `,
    buscarEscolhasDeTodos(),
  ]);

  const { selecoes, craques } = contarSelecoes(atuacoes, escolhas);

  return {
    futs,
    jogadores: jogadores.map((j) => ({
      ...j,
      selecoes: selecoes.get(j.jogadorId) ?? 0,
      craques: craques.get(j.jogadorId) ?? 0,
    })),
  };
}
