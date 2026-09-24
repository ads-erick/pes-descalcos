import type { Metadata } from "next";
import { LinkVoltar } from "@/components/link-voltar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FutForm } from "@/app/futs/fut-form";
import { isAdmin } from "@/data/auth";
import { listarEscalaveis } from "@/data/jogadores";
import { larguraForm, tituloPagina, vazio } from "@/lib/estilo";
import type { CorTime } from "@/lib/selecao";

export const metadata: Metadata = { title: "Registrar fut" };

// ?branco=id,id&preto=id,id vem do sorteio de times. Id que não é de ninguém do elenco é ignorado.
function lerTimesSorteados(
  params: Record<string, string | string[] | undefined>,
  elenco: Set<string>,
): Record<string, CorTime> | undefined {
  const times: Record<string, CorTime> = {};
  for (const cor of ["branco", "preto"] as const) {
    const valor = params[cor];
    if (typeof valor !== "string") continue;
    for (const id of valor.split(",")) {
      if (elenco.has(id)) times[id] = cor;
    }
  }
  return Object.keys(times).length > 0 ? times : undefined;
}

export default async function NovoFutPage({ searchParams }: PageProps<"/futs/novo">) {
  if (!(await isAdmin())) redirect("/admin/login?destino=/futs/novo");

  const jogadores = await listarEscalaveis();
  const timesSorteados = lerTimesSorteados(
    await searchParams,
    new Set(jogadores.map((j) => j.id)),
  );

  return (
    <main className={larguraForm}>
      <div className="mb-6">
        <LinkVoltar href="/futs" />
      </div>
      <h1 className={`${tituloPagina} mb-6`}>Registrar fut</h1>
      {jogadores.length === 0 ? (
        <p className={vazio}>
          Cadastre os jogadores primeiro em{" "}
          <Link href="/jogadores/novo" className="font-medium underline">
            novo jogador
          </Link>
          .
        </p>
      ) : (
        <FutForm jogadores={jogadores} timesSorteados={timesSorteados} />
      )}
    </main>
  );
}
