import type { Metadata } from "next";
import { isAdmin } from "@/data/auth";
import { listarJogadores } from "@/data/jogadores";
import { SorteioTimes } from "./sorteio-times";

export const metadata: Metadata = { title: "Sorteio de times" };

export default async function SorteioPage() {
  const [jogadores, admin] = await Promise.all([listarJogadores(), isAdmin()]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sorteio de times</h1>
        <p className="text-sm text-zinc-500">
          Marque quem vai jogar e o sorteio divide branco x preto pelo nível das cartinhas.
        </p>
      </div>

      {jogadores.length < 2 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          Precisa de pelo menos dois jogadores cadastrados pra sortear.
        </p>
      ) : (
        <SorteioTimes
          admin={admin}
          jogadores={jogadores.map((j) => ({
            id: j.id,
            nome: j.apelido ?? j.nome,
            posicao: j.posicao,
            nivel: j.nivel,
          }))}
        />
      )}
    </main>
  );
}
