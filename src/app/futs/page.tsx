import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Placar } from "@/components/placar";
import { isAdmin } from "@/data/auth";
import { listarFuts } from "@/data/futs";
import { botaoChip, botaoPequeno, botaoPrimario, larguraPadrao, painel, vazio } from "@/lib/estilo";
import { resultadoDoFut } from "@/lib/selecao";
import { BotaoCopiarTimes } from "./botao-copiar-times";

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
            // O card inteiro abre o fut pelo ::after do link da data, e o "Editar" fica
            // no fluxo ao lado do placar: posicionado por cima, ele cobria o placar no celular
            <li
              key={fut.id}
              className={`${painel} relative flex items-center gap-3 p-3 pl-4 transition duration-150 hover:border-destaque sm:gap-4`}
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/futs/${fut.id}`}
                  className="block font-numero text-2xl leading-none tracking-wide outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-destaque"
                >
                  {fut.data}
                </Link>
                <p
                  className={`mt-1 text-sm ${fut.faltamDias !== null ? "font-semibold text-ouro" : "text-apagado"}`}
                >
                  {resultadoDoFut(fut.placarBranco, fut.placarPreto, fut.faltamDias)}
                  {fut.craque && (
                    <>
                      {" · craque: "}
                      <span className="font-semibold text-ouro">{fut.craque.nome}</span>{" "}
                      {/* Margem além do espaço: em negrito e dourado o nome gruda no parêntese */}
                      <span className="ml-0.5">
                        ({fut.craque.gols}G/{fut.craque.assistencias}A)
                      </span>
                    </>
                  )}
                </p>
                {/* relative: fica por cima do ::after do link, senão o clique abria o fut */}
                {fut.faltamDias !== null && (
                  <BotaoCopiarTimes
                    futId={fut.id}
                    data={fut.data}
                    atuacoes={fut.atuacoes.map(({ nome, posicao, corTime }) => ({ nome, posicao, corTime }))}
                    className={`${botaoChip} relative mt-2.5`}
                  />
                )}
              </div>
              <Placar branco={fut.placarBranco} preto={fut.placarPreto} aRolar={fut.faltamDias !== null} />
              {admin && (
                <Link href={`/futs/${fut.id}/editar`} className={`${botaoPequeno} relative shrink-0`}>
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
