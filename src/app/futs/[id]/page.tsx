import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin } from "@/data/auth";
import { buscarDetalheFut, type AtuacaoNoFut } from "@/data/futs";
import { ehUuid } from "@/lib/id";
import { POSICAO_SIGLA } from "@/lib/jogador";
import { PONTOS, selecaoDoFut, vencedor, type CorTime } from "@/lib/selecao";

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
        <Link href="/futs" className="text-sm text-zinc-500 hover:underline">
          ← Futs
        </Link>
        {admin && (
          <Link href={`/futs/${fut.id}/editar`} className="text-sm text-zinc-500 hover:underline">
            Editar
          </Link>
        )}
      </div>

      <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Fut de {fut.data}
        </h1>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Placar cor="branco" gols={fut.placarBranco} venceu={venceu} />
          <span className="text-2xl text-zinc-400">x</span>
          <Placar cor="preto" gols={fut.placarPreto} venceu={venceu} />
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          {venceu ? `Vitória do ${NOME_TIME[venceu].toLowerCase()}` : "Empate"}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold">Seleção do fut</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Gol vale {PONTOS.gol} pts, assistência {PONTOS.assistencia} e vitória {PONTOS.vitoria}.
          Só entra quem participou de algum gol.
        </p>
        {selecao.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Ninguém fez gol nem deu assistência nesse fut.
          </p>
        ) : (
          <ol className="space-y-2">
            {selecao.map((atuacao, i) => (
              <li
                key={atuacao.jogadorId}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  i === 0
                    ? "border-amber-400 bg-amber-50 dark:border-amber-500/60 dark:bg-amber-950/30"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <span className="w-6 text-center text-lg font-black tabular-nums text-zinc-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {atuacao.nome}
                    {i === 0 && (
                      <span className="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-950">
                        Craque do fut
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {NOME_TIME[atuacao.corTime]} · {atuacao.gols}G {atuacao.assistencias}A
                  </p>
                </div>
                <span className="text-right">
                  <span className="text-xl font-black tabular-nums">{atuacao.pontos}</span>
                  <span className="ml-1 text-xs text-zinc-500">pts</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Escalação</h2>
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

function Placar({ cor, gols, venceu }: { cor: CorTime; gols: number; venceu: CorTime | null }) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-500">{NOME_TIME[cor]}</p>
      <p
        className={`text-5xl font-black tabular-nums ${
          venceu && venceu !== cor ? "text-zinc-400" : ""
        }`}
      >
        {gols}
      </p>
    </div>
  );
}

function Escalacao({ cor, atuacoes }: { cor: CorTime; atuacoes: AtuacaoNoFut[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <h3
        className={`px-4 py-2 text-sm font-bold ${
          cor === "branco"
            ? "bg-zinc-100 text-zinc-900"
            : "bg-zinc-900 text-white dark:bg-black"
        }`}
      >
        {NOME_TIME[cor]}
        <span className="ml-2 font-normal opacity-70">({atuacoes.length})</span>
      </h3>
      {atuacoes.length === 0 ? (
        <p className="p-4 text-sm text-zinc-500">Ninguém escalado.</p>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {atuacoes.map((a) => (
            <li key={a.jogadorId} className="flex items-center gap-3 px-4 py-2 text-sm">
              <span className="w-6 text-center font-bold tabular-nums text-zinc-400">
                {a.numero ?? "–"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{a.nome}</p>
                {a.nome !== a.nomeCompleto && (
                  <p className="truncate text-xs text-zinc-500">{a.nomeCompleto}</p>
                )}
              </div>
              {a.posicao && (
                <span className="text-xs font-semibold text-zinc-500">
                  {POSICAO_SIGLA[a.posicao]}
                </span>
              )}
              <span className="w-14 text-right tabular-nums">
                {a.gols > 0 || a.assistencias > 0 ? `${a.gols}G ${a.assistencias}A` : "–"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
