import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { buscarRankings, type EstatisticaDoPeriodo } from "@/data/rankings";
import { grupoBotoes, grupoBotoesItem, grupoBotoesItemAtual, larguraLarga, painel } from "@/lib/estilo";
import { POSICAO_SIGLA } from "@/lib/jogador";
import {
  PERIODOS,
  PERIODO_LABEL,
  descreverPeriodo,
  lerPeriodo,
  rankear,
} from "@/lib/ranking";

export const metadata: Metadata = { title: "Estatísticas" };

type Coluna = {
  titulo: string;
  // O que a tabela conta, pra quem bate o olho entender
  explicacao: string;
  vazio: string;
  valor: (j: EstatisticaDoPeriodo) => number;
  detalhe: (j: EstatisticaDoPeriodo) => string;
};

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

const COLUNAS: Coluna[] = [
  {
    titulo: "Gols",
    explicacao: "Gols marcados nos futs do período.",
    vazio: "Ninguém marcou ainda.",
    valor: (j) => j.gols,
    detalhe: (j) => plural(j.jogos, "jogo", "jogos"),
  },
  {
    titulo: "Assistências",
    explicacao: "Passes que terminaram em gol.",
    vazio: "Ninguém deu assistência ainda.",
    valor: (j) => j.assistencias,
    detalhe: (j) => plural(j.jogos, "jogo", "jogos"),
  },
  {
    titulo: "Vitórias",
    explicacao: "Futs em que o time do jogador ganhou. Empate não conta.",
    vazio: "Ninguém venceu ainda.",
    valor: (j) => j.vitorias,
    detalhe: (j) => `${Math.round((j.vitorias / j.jogos) * 100)}% dos jogos`,
  },
  {
    titulo: "Seleções",
    explicacao: "Vezes em que entrou na seleção do fut: o time dos 7 melhores do dia, do goleiro ao ataque.",
    vazio: "Ninguém entrou na seleção ainda.",
    valor: (j) => j.selecoes,
    detalhe: (j) => plural(j.jogos, "jogo", "jogos"),
  },
  {
    titulo: "Craques",
    explicacao: "Vezes em que foi o craque do fut, o melhor jogador da seleção do dia.",
    vazio: "Ninguém foi craque ainda.",
    valor: (j) => j.craques,
    detalhe: (j) => plural(j.jogos, "jogo", "jogos"),
  },
];

export default async function EstatisticasPage({ searchParams }: PageProps<"/estatisticas">) {
  const periodo = lerPeriodo((await searchParams).periodo);
  const { futs, jogadores } = await buscarRankings(periodo);

  return (
    <main className={larguraLarga}>
      <CabecalhoPagina
        titulo="Estatísticas"
        subtitulo={`${descreverPeriodo(periodo)} · ${plural(futs, "fut", "futs")}`}
      >
        <nav
          aria-label="Período"
          className={grupoBotoes}
        >
          {PERIODOS.map((p) => (
            <Link
              key={p}
              href={`/estatisticas?periodo=${p}`}
              aria-current={p === periodo ? "page" : undefined}
              className={`${grupoBotoesItem} ${p === periodo ? grupoBotoesItemAtual : ""}`}
            >
              {PERIODO_LABEL[p]}
            </Link>
          ))}
        </nav>
      </CabecalhoPagina>

      {/* 5 tabelas em 3 + 2: as de cima com um terço da largura, as de baixo com metade */}
      <div className="grid gap-4 md:grid-cols-6">
        {COLUNAS.map((coluna, i) => {
          const ranking = rankear(jogadores, coluna.valor);
          return (
            <section
              key={coluna.titulo}
              className={`${painel} overflow-hidden ${i < 3 ? "md:col-span-2" : "md:col-span-3"}`}
            >
              <h2 className="border-b-2 border-dourado bg-faixa px-4 pt-2 pb-1.5 font-slab text-lg text-sobre-faixa uppercase">
                {coluna.titulo}
              </h2>
              {/* Altura de 2 linhas pra todas: as listas lado a lado começam alinhadas */}
              <p className="px-4 pt-3 text-xs text-apagado md:min-h-[calc(2lh+0.75rem)]">
                {coluna.explicacao}
              </p>
              {ranking.length === 0 ? (
                <p className="py-6 text-center text-sm text-apagado">{coluna.vazio}</p>
              ) : (
                <ol className="space-y-1 p-3">
                  {ranking.map((j) => (
                    <li
                      key={j.jogadorId}
                      className={`flex items-center gap-3 rounded-md px-2 py-1.5 ${
                        j.colocacao === 1 ? "bg-ouro-suave" : ""
                      }`}
                    >
                      <span
                        className={`w-7 text-right font-numero text-xl leading-none ${
                          j.colocacao === 1 ? "text-ouro" : "text-apagado"
                        }`}
                      >
                        {j.colocacao}º
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-baseline gap-1.5 font-medium">
                          <span className="truncate">{j.nome}</span>
                          {j.posicao && (
                            <span className="shrink-0 font-numero text-sm tracking-wide text-apagado">
                              {POSICAO_SIGLA[j.posicao]}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-apagado">{coluna.detalhe(j)}</p>
                      </div>
                      <span className="font-numero text-3xl leading-none">{coluna.valor(j)}</span>
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
