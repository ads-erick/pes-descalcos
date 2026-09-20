import type { Metadata } from "next";
import { LinkVoltar } from "@/components/link-voltar";
import { notFound, redirect } from "next/navigation";
import { excluirJogadorAction } from "@/app/jogadores/actions";
import { JogadorForm } from "@/app/jogadores/jogador-form";
import { BotaoExcluir } from "@/components/botao-excluir";
import { isAdmin } from "@/data/auth";
import { buscarCartas, buscarJogador } from "@/data/jogadores";
import { larguraForm, tituloPagina } from "@/lib/estilo";
import { ehUuid } from "@/lib/id";

export const metadata: Metadata = { title: "Editar jogador" };

export default async function EditarJogadorPage({ params }: PageProps<"/jogadores/[id]/editar">) {
  const { id } = await params;
  if (!(await isAdmin())) redirect(`/admin/login?destino=/jogadores/${id}/editar`);
  if (!ehUuid(id)) notFound();

  const jogador = await buscarJogador(id);
  if (!jogador) notFound();

  // Números da carreira e nível já ajustado, pra prévia sair igual à carta do elenco
  const carta = (await buscarCartas([id])).get(id);

  return (
    <main className={larguraForm}>
      <div className="mb-6">
        <LinkVoltar href="/jogadores" />
      </div>
      <h1 className={`${tituloPagina} mb-6`}>Editar jogador</h1>
      <JogadorForm jogador={jogador} carta={carta}>
        <BotaoExcluir
          acao={excluirJogadorAction}
          confirmacao={`Excluir ${jogador.apelido ?? jogador.nome}? Se já jogou algum fut, sai do elenco mas continua no histórico das partidas.`}
        />
      </JogadorForm>
    </main>
  );
}
