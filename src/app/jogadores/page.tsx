import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { ListaElenco } from "@/app/jogadores/lista-elenco";
import { isAdmin } from "@/data/auth";
import { listarJogadores } from "@/data/jogadores";
import { botaoPrimario, larguraLarga, vazio } from "@/lib/estilo";

export const metadata: Metadata = { title: "Elenco" };

export default async function JogadoresPage() {
  const [jogadores, admin] = await Promise.all([listarJogadores(), isAdmin()]);
  const semJogadores = jogadores.length === 0;

  const novoJogador = admin && (
    <Link href="/jogadores/novo" className={botaoPrimario}>
      Novo jogador
    </Link>
  );

  return (
    <main className={larguraLarga}>
      <CabecalhoPagina
        titulo="Elenco"
        subtitulo={`${jogadores.length} ${jogadores.length === 1 ? "jogador" : "jogadores"} no elenco`}
      >
        {/* Com elenco, o botão desce pra linha dos filtros; vazio, não tem filtro */}
        {semJogadores && novoJogador}
      </CabecalhoPagina>

      {semJogadores ? (
        <p className={vazio}>
          Nenhum jogador cadastrado ainda.
        </p>
      ) : (
        <ListaElenco jogadores={jogadores} admin={admin} acao={novoJogador} />
      )}
    </main>
  );
}
