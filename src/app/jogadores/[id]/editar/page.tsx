import type { Metadata } from "next";
import { LinkVoltar } from "@/components/link-voltar";
import { notFound, redirect } from "next/navigation";
import { excluirJogadorAction } from "@/app/jogadores/actions";
import { JogadorForm } from "@/app/jogadores/jogador-form";
import { BotaoExcluir } from "@/components/botao-excluir";
import { isAdmin } from "@/data/auth";
import { buscarJogador } from "@/data/jogadores";
import { ehUuid } from "@/lib/id";

export const metadata: Metadata = { title: "Editar jogador" };

export default async function EditarJogadorPage({ params }: PageProps<"/jogadores/[id]/editar">) {
  const { id } = await params;
  if (!(await isAdmin())) redirect(`/admin/login?destino=/jogadores/${id}/editar`);
  if (!ehUuid(id)) notFound();

  const jogador = await buscarJogador(id);
  if (!jogador) notFound();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="mb-6">
        <LinkVoltar href="/jogadores" />
      </div>
      <h1 className="mb-6 font-slab text-3xl uppercase">Editar jogador</h1>
      <JogadorForm jogador={jogador}>
        <BotaoExcluir
          acao={excluirJogadorAction}
          confirmacao={`Excluir ${jogador.apelido ?? jogador.nome}? Se já jogou algum fut, sai do elenco mas continua no histórico das partidas.`}
        />
      </JogadorForm>
    </main>
  );
}
