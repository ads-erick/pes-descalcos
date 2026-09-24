import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/data/auth";
import { captchaSiteKey } from "@/data/captcha";
import { caminhoInterno } from "@/lib/caminho";
import { larguraEstreita, tituloPagina } from "@/lib/estilo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar como admin" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const destino = caminhoInterno((await searchParams).destino);
  if (await isAdmin()) redirect(destino);

  return (
    <main className={larguraEstreita}>
      <span className="escudo mx-auto mb-4 block h-24 text-destaque" aria-hidden />
      <h1 className={`${tituloPagina} mb-6 text-center`}>Área do admin</h1>
      <LoginForm destino={destino} captchaSiteKey={captchaSiteKey()} />
    </main>
  );
}
