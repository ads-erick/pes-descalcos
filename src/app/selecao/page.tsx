import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { CampoFut7 } from "@/components/campo-fut7";
import { JogadorCard } from "@/components/jogador-card";
import { buscarDetalheFut, listarFuts } from "@/data/futs";
import { buscarCartas } from "@/data/jogadores";
import { botaoPequeno, painel, vazio } from "@/lib/estilo";
import { ehUuid } from "@/lib/id";
import { POSICAO_SIGLA, type Posicao } from "@/lib/jogador";
import { escalarSelecao, formatarPontos, selecaoDoFut } from "@/lib/selecao";
import { SeletorFut } from "./seletor-fut";

export const metadata: Metadata = { title: "Seleção do fut" };

// Onde cada vaga fica no campo: centro horizontal e topo da carta, em % do campo
const LUGAR: Record<Posicao, { top: string; lefts: string[] }> = {
  atacante: { top: "2%", lefts: ["31%", "69%"] },
  meio: { top: "26%", lefts: ["22%", "78%"] },
  zagueiro: { top: "50%", lefts: ["31%", "69%"] },
  goleiro: { top: "76%", lefts: ["50%"] },
};

export default async function SelecaoPage({ searchParams }: PageProps<"/selecao">) {
  const { fut: pedido } = await searchParams;
  const futs = await listarFuts();

  if (futs.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <CabecalhoPagina titulo="Seleção do fut" />
        <p className={vazio}>Nenhum fut registrado ainda.</p>
      </main>
    );
  }

  // Sem fut escolhido, abre no último
  const id = typeof pedido === "string" && ehUuid(pedido) ? pedido : futs[0].id;
  const fut = await buscarDetalheFut(id);
  if (!fut) notFound();

  const vagas = escalarSelecao(fut.atuacoes, fut.placarBranco, fut.placarPreto);
  const escalados = vagas.flatMap((v) => (v.atuacao ? [v.atuacao] : []));
  const cartas = await buscarCartas(escalados.map((a) => a.jogadorId));
  // Mesmo craque da lista de futs: a maior nota do fut (se alguém pontuou)
  const craque = selecaoDoFut(fut.atuacoes, fut.placarBranco, fut.placarPreto)[0]?.jogadorId;

  const porPosicao = Map.groupBy(vagas, (v) => v.posicao);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <CabecalhoPagina
        titulo="Seleção do fut"
        subtitulo="Os melhores de cada posição, pela nota do fut"
      >
        <div className="flex items-end gap-3">
          <SeletorFut
            atual={fut.id}
            futs={futs.map((f) => ({
              id: f.id,
              rotulo: `${f.data} · ${f.placarBranco} x ${f.placarPreto}`,
            }))}
          />
          <Link href={`/futs/${fut.id}`} className={`${botaoPequeno} mb-0.5 h-10.5`}>
            Ver fut
          </Link>
        </div>
      </CabecalhoPagina>

      <div className="relative mx-auto aspect-[2/3] w-full max-w-[34rem] overflow-hidden rounded-xl border-2 border-dourado shadow-[4px_4px_0_var(--sombra)]">
        <CampoFut7 className="absolute inset-0 size-full" />
        {[...porPosicao].map(([posicao, daPosicao]) =>
          daPosicao.map((vaga, i) => {
            const lugar = LUGAR[posicao];
            const carta = vaga.atuacao && cartas.get(vaga.atuacao.jogadorId);
            return (
              <div
                key={`${posicao}-${i}`}
                className="absolute w-[23%] -translate-x-1/2"
                style={{ top: lugar.top, left: lugar.lefts[i] }}
              >
                {vaga.atuacao && carta ? (
                  <div className="relative">
                    <JogadorCard
                      jogador={carta}
                      inform
                      stats={[
                        { label: "GOL", valor: vaga.atuacao.gols },
                        { label: "AST", valor: vaga.atuacao.assistencias },
                        { label: "PTS", valor: formatarPontos(vaga.atuacao.pontos) },
                      ]}
                    />
                    {vaga.atuacao.jogadorId === craque && (
                      <span className="absolute -top-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-sm bg-dourado px-1.5 pt-0.5 font-numero text-xs leading-none tracking-wider whitespace-nowrap text-[#140f0a] uppercase shadow sm:text-sm">
                        <span className="escudo h-3" aria-hidden />
                        Craque
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="grid aspect-[5/7] place-items-center rounded-lg border-2 border-dashed border-white/50 font-numero text-lg tracking-wider text-white/70">
                    {POSICAO_SIGLA[posicao]}
                  </div>
                )}
              </div>
            );
          }),
        )}
      </div>

      {escalados.length > 0 && (
        <ol className={`${painel} mx-auto mt-8 max-w-[34rem] divide-y divide-linha`}>
          {vagas.map(
            (vaga, i) =>
              vaga.atuacao && (
                <li key={i} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <span className="w-8 font-numero text-base tracking-wide text-apagado">
                    {POSICAO_SIGLA[vaga.posicao]}
                  </span>
                  <p className="min-w-0 flex-1 truncate font-medium">
                    {vaga.atuacao.nome}
                    {vaga.atuacao.jogadorId === craque && (
                      <span className="ml-2 font-numero text-sm tracking-wider text-ouro uppercase">
                        Craque
                      </span>
                    )}
                    {vaga.atuacao.posicao !== vaga.posicao && (
                      <span className="ml-2 text-xs text-apagado">
                        (improvisado
                        {vaga.atuacao.posicao ? `, é ${POSICAO_SIGLA[vaga.atuacao.posicao]}` : ""})
                      </span>
                    )}
                  </p>
                  <span className="text-xs whitespace-nowrap text-apagado">
                    <span className="hidden sm:inline">Time {vaga.atuacao.corTime} · </span>
                    {vaga.atuacao.gols}G {vaga.atuacao.assistencias}A
                  </span>
                  <span className="w-14 text-right">
                    <span className="font-numero text-xl leading-none">
                      {formatarPontos(vaga.atuacao.pontos)}
                    </span>
                    <span className="ml-1 text-xs text-apagado">pts</span>
                  </span>
                </li>
              ),
          )}
        </ol>
      )}
    </main>
  );
}
