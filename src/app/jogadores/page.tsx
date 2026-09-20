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

  return (
    <main className={larguraLarga}>
      <CabecalhoPagina
        titulo="Elenco"
        subtitulo={`${jogadores.length} ${jogadores.length === 1 ? "jogador" : "jogadores"} no elenco`}
      >
        {admin && (
          <Link href="/jogadores/novo" className={botaoPrimario}>
            Novo jogador
          </Link>
        )}
      </CabecalhoPagina>

      {jogadores.length === 0 ? (
        <p className={vazio}>
          Nenhum jogador cadastrado ainda.
        </p>
      ) : (
        <ListaElenco jogadores={jogadores} admin={admin} />
      )}
    </main>
  );
}
