import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkVoltar } from "@/components/link-voltar";
import { Placar } from "@/components/placar";
import { isAdmin } from "@/data/auth";
import { buscarDetalheFut, type AtuacaoNoFut } from "@/data/futs";
import { buscarEscolhas } from "@/data/selecao";
import { botaoPequeno, faixaTime, larguraPadrao, painel, sombraTarja, tituloPagina, vazio } from "@/lib/estilo";
import { ehUuid } from "@/lib/id";
import { POSICAO_SIGLA } from "@/lib/jogador";
import {
  NOME_TIME,
  TAMANHO_SELECAO,
  craqueDoFut,
  resultadoDoFut,
  selecaoDoFut,
  type CorTime,
} from "@/lib/selecao";
import { BotaoCopiarTimes } from "../botao-copiar-times";

export async function generateMetadata({ params }: PageProps<"/futs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const fut = ehUuid(id) ? await buscarDetalheFut(id) : null;
  return { title: fut ? `Fut de ${fut.data}` : "Fut" };
}

export default async function FutPage({ params }: PageProps<"/futs/[id]">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const [fut, escolhas, admin] = await Promise.all([
    buscarDetalheFut(id),
    buscarEscolhas(id),
    isAdmin(),
  ]);
  if (!fut) notFound();

  const aRolar = fut.faltamDias !== null;
  // O craque abre os destaques. Sem escolha do admin ele já é o primeiro; escolhido na
  // mão, sobe pro topo (mesmo sem ter pontuado) e o resto segue pelos números
  const craque = craqueDoFut(
    fut.atuacoes,
    fut.placarBranco,
    fut.placarPreto,
    escolhas,
    fut.craqueId,
  )?.atuacao;
  const outros = selecaoDoFut(fut.atuacoes, fut.placarBranco, fut.placarPreto).filter(
    (a) => a.jogadorId !== craque?.jogadorId,
  );
  const selecao = (craque ? [craque, ...outros] : outros).slice(0, TAMANHO_SELECAO);

  return (
    <main className={larguraPadrao}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <LinkVoltar href="/futs">Futs</LinkVoltar>
        {admin && (
          <Link href={`/futs/${fut.id}/editar`} className={botaoPequeno}>
            Editar
          </Link>
        )}
      </div>

      <section className={`${painel} mb-10 px-4 py-6 text-center`}>
        <h1 className={tituloPagina}>Fut de {fut.data}</h1>
        <div className="mt-5 flex items-center justify-center gap-3 font-numero text-xl tracking-wider uppercase sm:gap-5">
          <span className="w-16 text-right sm:w-20">Branco</span>
          <Placar branco={fut.placarBranco} preto={fut.placarPreto} grande aRolar={aRolar} />
          <span className="w-16 text-left sm:w-20">Preto</span>
        </div>
        <p className={`mt-4 font-script text-2xl ${aRolar ? "text-ouro" : "text-apagado"}`}>
          {resultadoDoFut(fut.placarBranco, fut.placarPreto, fut.faltamDias)}
        </p>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-slab text-xl uppercase">Destaques do fut</h2>
          {!aRolar && (
            <Link href={`/selecao?fut=${fut.id}`} className={botaoPequeno}>
              Ver a seleção no campo →
            </Link>
          )}
        </div>
        {aRolar ? (
          <p className={`${vazio} text-sm`}>
            Esse fut ainda não rolou. Os destaques aparecem quando o resultado for lançado.
          </p>
        ) : selecao.length === 0 ? (
          <p className={`${vazio} text-sm`}>
            Ninguém pontuou nesse fut.
          </p>
        ) : (
          <ol className="space-y-2">
            {selecao.map((atuacao, i) => {
              const ehCraque = atuacao.jogadorId === craque?.jogadorId;
              return (
                <li
                  key={atuacao.jogadorId}
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 ${
                    ehCraque ? "border-ouro bg-ouro-suave" : "border-linha bg-superficie"
                  }`}
                >
                  <span
                    className={`w-7 text-center font-numero text-3xl leading-none ${
                      ehCraque ? "text-ouro" : "text-apagado"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {atuacao.nome}
                      {ehCraque && (
                        <span className={`${sombraTarja} ml-2 inline-flex items-center gap-1 rounded-sm bg-ouro px-1.5 pt-0.5 font-numero text-sm leading-none tracking-wider text-superficie uppercase`}>
                          <span className="escudo h-3.5" aria-hidden />
                          Craque do fut
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-apagado">
                      {NOME_TIME[atuacao.corTime]} · {atuacao.gols}G/{atuacao.assistencias}A
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-slab text-xl uppercase">Escalação</h2>
          {aRolar && (
            <BotaoCopiarTimes
              futId={fut.id}
              data={fut.data}
              atuacoes={fut.atuacoes.map(({ nome, posicao, corTime }) => ({ nome, posicao, corTime }))}
              className={botaoPequeno}
            />
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["branco", "preto"] as const).map((cor) => (
            <Escalacao
              key={cor}
              cor={cor}
              atuacoes={fut.atuacoes.filter((a) => a.corTime === cor)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function Escalacao({ cor, atuacoes }: { cor: CorTime; atuacoes: AtuacaoNoFut[] }) {
  return (
    <div className={`${painel} overflow-hidden`}>
      <h3
        className={`px-4 pt-2 pb-1.5 font-numero text-xl tracking-wider uppercase ${faixaTime[cor]}`}
      >
        {NOME_TIME[cor]}
      </h3>
      {atuacoes.length === 0 ? (
        <p className="p-4 text-sm text-apagado">Ninguém escalado.</p>
      ) : (
        <ul className="divide-y divide-linha">
          {atuacoes.map((a) => (
            <li key={a.jogadorId} className="flex items-center gap-3 px-4 py-2 text-sm">
              <span className="w-6 text-center font-numero text-lg text-apagado">
                {a.numero ?? "–"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{a.nome}</p>
                {a.nome !== a.nomeCompleto && (
                  <p className="truncate text-xs text-apagado">{a.nomeCompleto}</p>
                )}
              </div>
              {a.posicao && (
                <span className="font-numero text-base tracking-wide text-apagado">
                  {POSICAO_SIGLA[a.posicao]}
                </span>
              )}
              <span className="w-14 text-right tabular-nums">
                {a.gols > 0 || a.assistencias > 0 ? `${a.gols}G/${a.assistencias}A` : "–"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
