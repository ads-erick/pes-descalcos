import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { CartaMenu } from "@/components/carta-menu";
import { JogadorCard } from "@/components/jogador-card";
import { isAdmin } from "@/data/auth";
import { listarJogadores } from "@/data/jogadores";
import { botaoPrimario, larguraLarga, vazio, zoomCarta } from "@/lib/estilo";

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
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {jogadores.map((jogador) => {
            const nome = jogador.apelido ?? jogador.nome;
            return (
              <li key={jogador.id}>
                {/* Botão direito em qualquer carta abre o menu de copiar/baixar */}
                <CartaMenu nome={nome}>
                  {/* Pro admin a carta inteira abre a edição */}
                  {admin ? (
                    <Link
                      href={`/jogadores/${jogador.id}/editar`}
                      aria-label={`Editar ${nome}`}
                      className={`${zoomCarta} rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destaque`}
                    >
                      <JogadorCard jogador={jogador} />
                    </Link>
                  ) : (
                    <div className={zoomCarta}>
                      <JogadorCard jogador={jogador} />
                    </div>
                  )}
                </CartaMenu>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
