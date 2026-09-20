import type { Metadata } from "next";
import { LinkVoltar } from "@/components/link-voltar";
import { notFound, redirect } from "next/navigation";
import { excluirFutAction } from "@/app/futs/actions";
import { FutForm } from "@/app/futs/fut-form";
import { BotaoExcluir } from "@/components/botao-excluir";
import { isAdmin } from "@/data/auth";
import { buscarFut } from "@/data/futs";
import { listarEscalaveis } from "@/data/jogadores";
import { larguraPadrao, tituloPagina } from "@/lib/estilo";
import { ehUuid } from "@/lib/id";

export const metadata: Metadata = { title: "Editar fut" };

export default async function EditarFutPage({ params }: PageProps<"/futs/[id]/editar">) {
  const { id } = await params;
  if (!(await isAdmin())) redirect(`/admin/login?destino=/futs/${id}/editar`);
  if (!ehUuid(id)) notFound();

  const [fut, jogadores] = await Promise.all([buscarFut(id), listarEscalaveis(id)]);
  if (!fut) notFound();

  return (
    <main className={larguraPadrao}>
      <div className="mb-6">
        <LinkVoltar href={`/futs/${id}`} />
      </div>
      <h1 className={`${tituloPagina} mb-6`}>Editar fut</h1>
      <FutForm jogadores={jogadores} fut={fut}>
        <BotaoExcluir
          acao={excluirFutAction}
          confirmacao="Excluir este fut? Os gols e assistências dele saem das cartinhas."
        />
      </FutForm>
    </main>
  );
}
