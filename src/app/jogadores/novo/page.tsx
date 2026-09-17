import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/data/auth";
import { JogadorForm } from "./jogador-form";

export const metadata: Metadata = { title: "Novo jogador" };

export default async function NovoJogadorPage() {
  if (!(await isAdmin())) redirect("/admin/login?destino=/jogadores/novo");

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Novo jogador</h1>
      <JogadorForm />
    </main>
  );
}
