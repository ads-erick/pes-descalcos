import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/data/auth";
import { listarFuts } from "@/data/futs";

export const metadata: Metadata = { title: "Futs" };

export default async function FutsPage() {
  const [futs, admin] = await Promise.all([listarFuts(), isAdmin()]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Futs</h1>
          <p className="text-sm text-zinc-500">
            {futs.length} {futs.length === 1 ? "fut registrado" : "futs registrados"}
          </p>
        </div>
        {admin && (
          <Link
            href="/futs/novo"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Registrar fut
          </Link>
        )}
      </div>

      {futs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          Nenhum fut registrado ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {futs.map((fut) => (
            <li
              key={fut.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <p className="font-semibold">{fut.data}</p>
                <p className="text-sm text-zinc-500">
                  {fut.jogadores} {fut.jogadores === 1 ? "jogador" : "jogadores"}
                  {fut.destaque && (
                    <>
                      {" · destaque: "}
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {fut.destaque.nome}
                      </span>{" "}
                      ({fut.destaque.gols}G {fut.destaque.assistencias}A)
                    </>
                  )}
                </p>
              </div>
              <p className="text-lg font-black tabular-nums">
                <span title="Time branco">{fut.placarBranco}</span>
                <span className="mx-2 text-zinc-400">x</span>
                <span title="Time preto">{fut.placarPreto}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
