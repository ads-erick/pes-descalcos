import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { JogadorCard } from "@/components/jogador-card";
import { isAdmin } from "@/data/auth";
import { listarJogadores } from "@/data/jogadores";
import { botaoPrimario, vazio } from "@/lib/estilo";

export const metadata: Metadata = { title: "Elenco" };

const zoom = "block transition duration-200 ease-out hover:scale-105 focus-visible:scale-105";

export default async function JogadoresPage() {
  const [jogadores, admin] = await Promise.all([listarJogadores(), isAdmin()]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
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
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {jogadores.map((jogador) => (
            <li key={jogador.id}>
              {/* Pro admin a carta inteira abre a edição */}
              {admin ? (
                <Link
                  href={`/jogadores/${jogador.id}/editar`}
                  aria-label={`Editar ${jogador.apelido ?? jogador.nome}`}
                  className={`${zoom} rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destaque`}
                >
                  <JogadorCard jogador={jogador} />
                </Link>
              ) : (
                <div className={zoom}>
                  <JogadorCard jogador={jogador} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
