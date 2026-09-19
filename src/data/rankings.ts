import "server-only";
import { connection } from "next/server";
import { sql } from "./db";
import type { Posicao } from "@/lib/jogador";
import { inicioDoPeriodo, type Periodo } from "@/lib/ranking";

export type EstatisticaDoPeriodo = {
  jogadorId: string;
  nome: string;
  posicao: Posicao | null;
  jogos: number;
  gols: number;
  assistencias: number;
};

export type Rankings = {
  futs: number;
  jogadores: EstatisticaDoPeriodo[];
};

// Arquivados entram: os gols deles continuam valendo no período em que jogaram
export async function buscarRankings(periodo: Periodo): Promise<Rankings> {
  await connection();
  const desde = inicioDoPeriodo(periodo);

  const [[{ futs }], jogadores] = await Promise.all([
    sql<{ futs: number }[]>`
      select count(*)::int as futs
      from fut
      where ${desde}::date is null or data >= ${desde}::date
    `,
    sql<EstatisticaDoPeriodo[]>`
      select
        j.id as "jogadorId",
        coalesce(j.apelido, j.nome) as nome,
        j.posicao,
        count(p.id) filter (where p.presente)::int as jogos,
        sum(p.gols)::int as gols,
        sum(p.assistencias)::int as assistencias
      from participacao p
      join fut f on f.id = p.fut_id
      join jogador j on j.id = p.jogador_id
      where ${desde}::date is null or f.data >= ${desde}::date
      group by j.id
    `,
  ]);

  return { futs, jogadores };
}
