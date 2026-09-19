import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/data/auth";
import { caminhoInterno } from "@/lib/caminho";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar como admin" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const destino = caminhoInterno((await searchParams).destino);
  if (await isAdmin()) redirect(destino);

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-12">
      <span className="escudo mx-auto mb-4 block h-24 text-destaque" aria-hidden />
      <h1 className="mb-2 text-center font-slab text-3xl uppercase">Área do admin</h1>
      <p className="mb-6 text-center text-sm text-apagado">
        Só quem lança os dados dos futs precisa entrar.
      </p>
      <LoginForm destino={destino} />
    </main>
  );
}
