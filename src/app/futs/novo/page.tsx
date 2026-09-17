import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/data/auth";
import { listarJogadores } from "@/data/jogadores";
import { FutForm } from "./fut-form";

export const metadata: Metadata = { title: "Registrar fut" };

export default async function NovoFutPage() {
  if (!(await isAdmin())) redirect("/admin/login?destino=/futs/novo");

  const jogadores = await listarJogadores();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Registrar fut</h1>
      {jogadores.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          Cadastre os jogadores primeiro em{" "}
          <Link href="/jogadores/novo" className="font-medium underline">
            novo jogador
          </Link>
          .
        </p>
      ) : (
        <FutForm
          jogadores={jogadores.map((jogador) => ({
            id: jogador.id,
            nome: jogador.apelido ?? jogador.nome,
            numero: jogador.numero,
          }))}
        />
      )}
    </main>
  );
}
