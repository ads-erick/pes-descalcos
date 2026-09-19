import type { Metadata } from "next";
import Link from "next/link";
import { buscarRankings, type EstatisticaDoPeriodo } from "@/data/rankings";
import { POSICAO_SIGLA } from "@/lib/jogador";
import {
  PERIODOS,
  PERIODO_LABEL,
  descreverPeriodo,
  lerPeriodo,
  rankear,
} from "@/lib/ranking";

export const metadata: Metadata = { title: "Rankings" };

type Coluna = {
  titulo: string;
  vazio: string;
  valor: (j: EstatisticaDoPeriodo) => number;
  detalhe: (j: EstatisticaDoPeriodo, futs: number) => string;
};

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

const COLUNAS: Coluna[] = [
  {
    titulo: "Artilharia",
    vazio: "Ninguém marcou ainda.",
    valor: (j) => j.gols,
    detalhe: (j) => plural(j.jogos, "jogo", "jogos"),
  },
  {
    titulo: "Assistências",
    vazio: "Ninguém deu assistência ainda.",
    valor: (j) => j.assistencias,
    detalhe: (j) => plural(j.jogos, "jogo", "jogos"),
  },
  {
    titulo: "Presença",
    vazio: "Nenhum fut no período.",
    valor: (j) => j.jogos,
    detalhe: (j, futs) => `${Math.round((j.jogos / futs) * 100)}% dos futs`,
  },
];

export default async function RankingsPage({ searchParams }: PageProps<"/rankings">) {
  const periodo = lerPeriodo((await searchParams).periodo);
  const { futs, jogadores } = await buscarRankings(periodo);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Rankings</h1>
          <p className="text-sm text-zinc-500">
            {descreverPeriodo(periodo)} · {plural(futs, "fut", "futs")}
          </p>
        </div>
        <nav aria-label="Período" className="flex rounded-full bg-zinc-200 p-1 text-sm dark:bg-zinc-800">
          {PERIODOS.map((p) => (
            <Link
              key={p}
              href={`/rankings?periodo=${p}`}
              aria-current={p === periodo ? "page" : undefined}
              className={`rounded-full px-3 py-1 ${
                p === periodo
                  ? "bg-white font-semibold shadow-sm dark:bg-zinc-950"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {PERIODO_LABEL[p]}
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUNAS.map((coluna) => {
          const ranking = rankear(jogadores, coluna.valor);
          return (
            <section
              key={coluna.titulo}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="mb-3 font-bold">{coluna.titulo}</h2>
              {ranking.length === 0 ? (
                <p className="py-4 text-center text-sm text-zinc-500">{coluna.vazio}</p>
              ) : (
                <ol className="space-y-1">
                  {ranking.map((j) => (
                    <li
                      key={j.jogadorId}
                      className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${
                        j.colocacao === 1 ? "bg-amber-100 dark:bg-amber-900/30" : ""
                      }`}
                    >
                      <span className="w-6 text-right text-sm font-bold tabular-nums text-zinc-500">
                        {j.colocacao}º
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {j.nome}
                          {j.posicao && (
                            <span className="ml-1.5 text-xs text-zinc-500">
                              {POSICAO_SIGLA[j.posicao]}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-500">{coluna.detalhe(j, futs)}</p>
                      </div>
                      <span className="text-lg font-black tabular-nums">{coluna.valor(j)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
