import "server-only";
import { connection } from "next/server";
import { sql } from "./db";
import type { Posicao } from "@/lib/jogador";
import { inicioDoPeriodo, type Periodo } from "@/lib/ranking";
import { selecaoDoFut, type Atuacao } from "@/lib/selecao";

export type EstatisticaDoPeriodo = {
  jogadorId: string;
  nome: string;
  posicao: Posicao | null;
  jogos: number;
  gols: number;
  assistencias: number;
  vitorias: number;
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
};

// Craque do fut é o primeiro da seleção: dá pra contar só refazendo a conta fut a fut
function contarCraques(atuacoes: AtuacaoDoFut[]): Map<string, number> {
  const craques = new Map<string, number>();
  for (const doFut of Map.groupBy(atuacoes, (a) => a.futId).values()) {
    const [craque] = selecaoDoFut(doFut, doFut[0].placarBranco, doFut[0].placarPreto);
    if (craque) craques.set(craque.jogadorId, (craques.get(craque.jogadorId) ?? 0) + 1);
  }
  return craques;
}

// Arquivados entram: os gols deles continuam valendo no período em que jogaram
export async function buscarRankings(periodo: Periodo): Promise<Rankings> {
  await connection();
  const desde = inicioDoPeriodo(periodo);

  const [[{ futs }], jogadores, atuacoes] = await Promise.all([
    sql<{ futs: number }[]>`
      select count(*)::int as futs
      from fut
      where ${desde}::date is null or data >= ${desde}::date
    `,
    sql<Omit<EstatisticaDoPeriodo, "craques">[]>`
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
  ]);

  const craques = contarCraques(atuacoes);

  return {
    futs,
    jogadores: jogadores.map((j) => ({ ...j, craques: craques.get(j.jogadorId) ?? 0 })),
  };
}
