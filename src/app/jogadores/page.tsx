import type { Metadata } from "next";
import Link from "next/link";
import { JogadorCard } from "@/components/jogador-card";
import { isAdmin } from "@/data/auth";
import { listarJogadores } from "@/data/jogadores";

export const metadata: Metadata = { title: "Jogadores" };

export default async function JogadoresPage() {
  const [jogadores, admin] = await Promise.all([listarJogadores(), isAdmin()]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Jogadores</h1>
          <p className="text-sm text-zinc-500">
            {jogadores.length} {jogadores.length === 1 ? "jogador" : "jogadores"} no elenco
          </p>
        </div>
        {admin && (
          <Link
            href="/jogadores/novo"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Novo jogador
          </Link>
        )}
      </div>

      {jogadores.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          Nenhum jogador cadastrado ainda.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {jogadores.map((jogador) => (
            <li key={jogador.id}>
              <JogadorCard jogador={jogador} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
