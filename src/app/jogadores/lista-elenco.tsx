"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CartaMenu } from "@/components/carta-menu";
import { JogadorCard } from "@/components/jogador-card";
import type { JogadorResumo } from "@/data/jogadores";
import {
  campo,
  grupoBotoes,
  grupoBotoesItem,
  grupoBotoesItemAtual,
  vazio,
  zoomCarta,
} from "@/lib/estilo";
import { POSICAO_LABEL, POSICAO_SIGLA, POSICOES, normalizar, type Posicao } from "@/lib/jogador";

export function ListaElenco({
  jogadores,
  admin,
  acao,
}: {
  jogadores: JogadorResumo[];
  admin: boolean;
  // Botão do admin (novo jogador), na ponta direita da linha dos filtros
  acao?: React.ReactNode;
}) {
  const [busca, setBusca] = useState("");
  const [posicao, setPosicao] = useState<Posicao | null>(null);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return jogadores.filter((jogador) => {
      if (posicao && jogador.posicao !== posicao) return false;
      if (!termo) return true;
      // Nome, apelido e número: qualquer um serve pra achar a carta
      return [jogador.nome, jogador.apelido, jogador.numero]
        .filter((valor) => valor !== null)
        .some((valor) => normalizar(String(valor)).includes(termo));
    });
  }, [jogadores, busca, posicao]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Buscar por nome ou número"
          aria-label="Buscar jogador"
          className={`${campo} min-w-0 flex-1 basis-40 sm:max-w-xs`}
        />

        {/* No celular os filtros descem: a busca divide a linha com o botão do admin */}
        <nav aria-label="Posição" className={`${grupoBotoes} max-sm:order-last`}>
          <button
            type="button"
            onClick={() => setPosicao(null)}
            aria-pressed={posicao === null}
            className={`${grupoBotoesItem} ${posicao === null ? grupoBotoesItemAtual : ""}`}
          >
            Todos
          </button>
          {POSICOES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPosicao(p)}
              aria-pressed={posicao === p}
              aria-label={POSICAO_LABEL[p]}
              className={`${grupoBotoesItem} ${posicao === p ? grupoBotoesItemAtual : ""}`}
            >
              {POSICAO_SIGLA[p]}
            </button>
          ))}
        </nav>

        {/* Só aparece filtrando: sem filtro a contagem já está no subtítulo */}
        {(busca.trim() !== "" || posicao !== null) && (
          <p aria-live="polite" className="text-sm text-apagado max-sm:order-last">
            {filtrados.length} de {jogadores.length}
          </p>
        )}

        {acao && <div className="ml-auto">{acao}</div>}
      </div>

      {filtrados.length === 0 ? (
        <p className={vazio}>Nenhum jogador encontrado com esses filtros.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {filtrados.map((jogador) => {
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
    </>
  );
}
