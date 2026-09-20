import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkVoltar } from "@/components/link-voltar";
import { Placar } from "@/components/placar";
import { isAdmin } from "@/data/auth";
import { buscarDetalheFut, type AtuacaoNoFut } from "@/data/futs";
import { botaoPequeno, faixaTime, painel, vazio } from "@/lib/estilo";
import { ehUuid } from "@/lib/id";
import { POSICAO_SIGLA } from "@/lib/jogador";
import { selecaoDoFut, vencedor, type CorTime } from "@/lib/selecao";

export async function generateMetadata({ params }: PageProps<"/futs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const fut = ehUuid(id) ? await buscarDetalheFut(id) : null;
  return { title: fut ? `Fut de ${fut.data}` : "Fut" };
}

const NOME_TIME: Record<CorTime, string> = { branco: "Time branco", preto: "Time preto" };

export default async function FutPage({ params }: PageProps<"/futs/[id]">) {
  const { id } = await params;
  if (!ehUuid(id)) notFound();

  const [fut, admin] = await Promise.all([buscarDetalheFut(id), isAdmin()]);
  if (!fut) notFound();

  const venceu = vencedor(fut.placarBranco, fut.placarPreto);
  const selecao = selecaoDoFut(fut.atuacoes, fut.placarBranco, fut.placarPreto);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <LinkVoltar href="/futs">Futs</LinkVoltar>
        {admin && (
          <Link href={`/futs/${fut.id}/editar`} className={botaoPequeno}>
            Editar
          </Link>
        )}
      </div>

      <section className={`${painel} mb-10 px-4 py-6 text-center`}>
        <h1 className="font-slab text-2xl uppercase sm:text-3xl">Fut de {fut.data}</h1>
        <div className="mt-5 flex items-center justify-center gap-3 font-numero text-xl tracking-wider uppercase sm:gap-5">
          <span className="w-16 text-right sm:w-20">Branco</span>
          <Placar branco={fut.placarBranco} preto={fut.placarPreto} grande />
          <span className="w-16 text-left sm:w-20">Preto</span>
        </div>
        <p className="mt-4 font-script text-2xl text-apagado">
          {venceu ? `Vitória do ${NOME_TIME[venceu].toLowerCase()}` : "Empate"}
        </p>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-slab text-xl uppercase">Destaques do fut</h2>
          <Link href={`/selecao?fut=${fut.id}`} className={botaoPequeno}>
            Ver a seleção no campo →
          </Link>
        </div>
        {selecao.length === 0 ? (
          <p className={`${vazio} text-sm`}>
            Ninguém pontuou nesse fut.
          </p>
        ) : (
          <ol className="space-y-2">
            {selecao.map((atuacao, i) => (
              <li
                key={atuacao.jogadorId}
                className={`flex items-center gap-3 rounded-lg border-2 p-3 ${
                  i === 0 ? "border-ouro bg-ouro-suave" : "border-linha bg-superficie"
                }`}
              >
                <span
                  className={`w-7 text-center font-numero text-3xl leading-none ${
                    i === 0 ? "text-ouro" : "text-apagado"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {atuacao.nome}
                    {i === 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-sm bg-ouro px-1.5 pt-0.5 font-numero text-sm leading-none tracking-wider text-superficie uppercase">
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
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-slab text-xl uppercase">Escalação</h2>
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
