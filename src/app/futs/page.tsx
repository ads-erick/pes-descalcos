import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Placar } from "@/components/placar";
import { isAdmin } from "@/data/auth";
import { listarFuts } from "@/data/futs";
import { botaoPequeno, botaoPrimario, larguraPadrao, painelClicavel, vazio } from "@/lib/estilo";

export const metadata: Metadata = { title: "Futs" };

export default async function FutsPage() {
  const [futs, admin] = await Promise.all([listarFuts(), isAdmin()]);

  return (
    <main className={larguraPadrao}>
      <CabecalhoPagina
        titulo="Futs"
        subtitulo={`${futs.length} ${futs.length === 1 ? "fut registrado" : "futs registrados"}`}
      >
        {admin && (
          <Link href="/futs/novo" className={botaoPrimario}>
            Registrar fut
          </Link>
        )}
      </CabecalhoPagina>

      {futs.length === 0 ? (
        <p className={vazio}>
          Nenhum fut registrado ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {futs.map((fut) => (
            // O "Editar" fica dentro do card (posicionado), pra lista e cabeçalho
            // terem a mesma largura
            <li key={fut.id} className="relative">
              <Link
                href={`/futs/${fut.id}`}
                className={`${painelClicavel} flex items-center justify-between gap-4 p-3 pl-4 ${admin ? "pr-28" : ""}`}
              >
                <div className="min-w-0">
                  <p className="font-numero text-2xl leading-none tracking-wide">{fut.data}</p>
                  <p className="mt-1 text-sm text-apagado">
                    {fut.jogadores} {fut.jogadores === 1 ? "jogador" : "jogadores"}
                    {fut.craque && (
                      <>
                        {" · craque: "}
                        <span className="font-semibold text-ouro">
                          {fut.craque.nome}
                        </span>{" "}
                        ({fut.craque.gols}G/{fut.craque.assistencias}A)
                      </>
                    )}
                  </p>
                </div>
                <Placar branco={fut.placarBranco} preto={fut.placarPreto} />
              </Link>
              {admin && (
                <Link
                  href={`/futs/${fut.id}/editar`}
                  className={`${botaoPequeno} absolute top-1/2 right-3 -translate-y-1/2`}
                >
                  Editar
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
