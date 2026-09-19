import type { Metadata } from "next";
import { LinkVoltar } from "@/components/link-voltar";
import { redirect } from "next/navigation";
import { isAdmin } from "@/data/auth";
import { JogadorForm } from "@/app/jogadores/jogador-form";

export const metadata: Metadata = { title: "Novo jogador" };

export default async function NovoJogadorPage() {
  if (!(await isAdmin())) redirect("/admin/login?destino=/jogadores/novo");

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="mb-6">
        <LinkVoltar href="/jogadores" />
      </div>
      <h1 className="mb-6 font-slab text-3xl uppercase">Novo jogador</h1>
      <JogadorForm />
    </main>
  );
}
