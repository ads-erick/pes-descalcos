import type { Metadata } from "next";
import { LinkVoltar } from "@/components/link-voltar";
import { redirect } from "next/navigation";
import { isAdmin } from "@/data/auth";
import { JogadorForm } from "@/app/jogadores/jogador-form";
import { larguraForm, tituloPagina } from "@/lib/estilo";

export const metadata: Metadata = { title: "Novo jogador" };

export default async function NovoJogadorPage() {
  if (!(await isAdmin())) redirect("/admin/login?destino=/jogadores/novo");

  return (
    <main className={larguraForm}>
      <div className="mb-6">
        <LinkVoltar href="/jogadores" />
      </div>
      <h1 className={`${tituloPagina} mb-6`}>Novo jogador</h1>
      <JogadorForm />
    </main>
  );
}
