import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { CampoFut7 } from "@/components/campo-fut7";
import { CartaMenu } from "@/components/carta-menu";
import { JogadorCard } from "@/components/jogador-card";
import { buscarDetalheFut, listarFuts } from "@/data/futs";
import { buscarCartas } from "@/data/jogadores";
import { botaoSecundario, larguraCampo, larguraPadrao, painel, sombraCartao, sombraTarja, vazio, zoomCarta } from "@/lib/estilo";
import { ehUuid } from "@/lib/id";
import { POSICAO_SIGLA, type Posicao } from "@/lib/jogador";
import { escalarSelecao, selecaoDoFut } from "@/lib/selecao";
import { AlvoPrevia, Previa, PreviaCartas } from "./previa-carta";
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
      <main className={larguraPadrao}>
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

  // A cartinha de um escalado, com os números do fut: serve no campo e na prévia
  function cartinha(atuacao: (typeof escalados)[number]) {
    const carta = cartas.get(atuacao.jogadorId);
    if (!carta) return null;
    return (
      // Só a carta entra no menu: a tarja de craque fica de fora da imagem
      <CartaMenu nome={carta.apelido ?? carta.nome} sufixo="seleção">
        <JogadorCard
          jogador={carta}
          inform
          stats={[
            { label: "GOL", valor: atuacao.gols },
            { label: "AST", valor: atuacao.assistencias },
          ]}
        />
      </CartaMenu>
    );
  }

  return (
    <main className={larguraCampo}>
      {/* No desktop, a coluna da esquerda leva filtro, lista e prévia; o campo fica à direita, bem maior */}
      {/* A escolha some quando o fut muda: a chave remonta a prévia */}
      <PreviaCartas key={fut.id} padrao={craque}>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_auto_auto_1fr] lg:gap-8">
          {/* O cabeçalho já traz margem embaixo: sem isso ele fica longe demais do filtro */}
          <div className="-mb-6 lg:-mb-8">
            <CabecalhoPagina titulo="Seleção do fut" />
          </div>

          <div className="flex w-full items-end gap-3 lg:col-start-1 lg:row-start-2">
            <SeletorFut
              atual={fut.id}
              futs={futs.map((f) => ({
                id: f.id,
                rotulo: `${f.data} · ${f.placarBranco} x ${f.placarPreto}`,
              }))}
            />
            <Link href={`/futs/${fut.id}`} className={botaoSecundario}>
              Ver fut
            </Link>
          </div>

          {/* Na tela grande o campo cresce pela altura da janela, e a largura vem da proporção */}
          <div className={`${sombraCartao} relative mx-auto aspect-[2/3] w-full overflow-hidden rounded-xl border-2 border-dourado lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:h-[calc(100vh-9rem)] lg:w-auto`}>
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
                      // O zoom fica aqui fora pra tarja de craque crescer junto com a carta
                      <AlvoPrevia
                        id={vaga.atuacao.jogadorId}
                        className={`relative ${zoomCarta}`}
                      >
                        {cartinha(vaga.atuacao)}
                        {vaga.atuacao.jogadorId === craque && (
                          <span className={`${sombraTarja} absolute -top-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-sm bg-dourado px-1.5 pt-0.5 font-numero text-xs leading-none tracking-wider whitespace-nowrap text-sobre-dourado uppercase sm:text-sm`}>
                            <span className="escudo h-3" aria-hidden />
                            Craque
                          </span>
                        )}
                      </AlvoPrevia>
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
            <ol className={`${painel} divide-y divide-linha lg:col-start-1 lg:row-start-3`}>
              {vagas.map(
                (vaga, i) =>
                  vaga.atuacao && (
                    <AlvoPrevia
                      key={i}
                      como="li"
                      id={vaga.atuacao.jogadorId}
                      className="flex items-center gap-3 px-4 py-2 text-sm"
                    >
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
                        {vaga.atuacao.gols}G/{vaga.atuacao.assistencias}A
                      </span>
                    </AlvoPrevia>
                  ),
              )}
            </ol>
          )}

          {/* A carta em tamanho de gente: segue o mouse pelo campo e pela lista */}
          {escalados.length > 0 && (
            <Previa
              className="hidden lg:col-start-1 lg:row-start-4 lg:block"
              cartas={escalados.flatMap((atuacao) => {
                const carta = cartinha(atuacao);
                return carta ? [{ id: atuacao.jogadorId, carta }] : [];
              })}
            />
          )}
        </div>
      </PreviaCartas>
    </main>
  );
}
