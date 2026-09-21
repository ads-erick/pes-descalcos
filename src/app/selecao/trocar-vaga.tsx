"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { botaoChip, painel, sombraCartao } from "@/lib/estilo";
import { POSICAO_LABEL, POSICAO_SIGLA, type Posicao } from "@/lib/jogador";
import { trocarVaga } from "./actions";

export type Opcao = {
  jogadorId: string;
  nome: string;
  posicao: Posicao | null;
  corTime: "branco" | "preto";
  gols: number;
  assistencias: number;
};

// Só pro admin: clicar na carta (ou na vaga vazia) abre a lista de quem jogou o fut pra
// pôr outro no lugar. Qualquer um serve, de qualquer posição.
export function TrocarVaga({
  futId,
  vaga,
  posicao,
  atual,
  manual,
  opcoes,
  children,
}: {
  futId: string;
  vaga: number;
  posicao: Posicao;
  atual: string | null;
  manual: boolean;
  // Já na ordem da seleção: os melhores números primeiro
  opcoes: Opcao[];
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const [salvando, iniciar] = useTransition();
  const [erro, setErro] = useState(false);

  // Fecha com Esc
  useEffect(() => {
    if (!aberto) return;
    const naTecla = (evento: KeyboardEvent) => evento.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", naTecla);
    return () => window.removeEventListener("keydown", naTecla);
  }, [aberto]);

  function abrir(evento: React.SyntheticEvent) {
    // O menu da carta (copiar/baixar) vive num portal, mas o clique nele sobe pela
    // árvore do React até aqui: só vale clique na carta mesmo
    if (!evento.currentTarget.contains(evento.target as Node)) return;
    setErro(false);
    setAberto(true);
  }

  function escolher(jogadorId: string | null) {
    const dados = new FormData();
    dados.set("futId", futId);
    dados.set("vaga", String(vaga));
    dados.set("jogadorId", jogadorId ?? "");
    iniciar(async () => {
      try {
        await trocarVaga(dados);
        setAberto(false);
      } catch {
        setErro(true);
      }
    });
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Trocar quem está na vaga de ${POSICAO_LABEL[posicao].toLowerCase()}`}
        title="Trocar jogador"
        className="cursor-pointer"
        onClick={abrir}
        onKeyDown={(evento) => (evento.key === "Enter" || evento.key === " ") && abrir(evento)}
      >
        {children}
      </div>

      {aberto &&
        createPortal(
          // Véu preto fixo (não o token da tinta): ele cobre a página nos dois temas
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Trocar jogador da seleção"
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
            onPointerDown={(evento) => evento.target === evento.currentTarget && setAberto(false)}
          >
            <div className={`${painel} ${sombraCartao} flex max-h-[85vh] w-full max-w-sm flex-col`}>
              <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
                <div>
                  <h2 className="font-slab text-lg uppercase">Vaga de {POSICAO_LABEL[posicao]}</h2>
                  <p className="text-sm text-apagado">
                    Escolha quem entra. Vale qualquer um que jogou o fut.
                  </p>
                </div>
                <button type="button" className={botaoChip} onClick={() => setAberto(false)}>
                  Fechar
                </button>
              </div>

              <ul className="min-h-0 flex-1 divide-y divide-linha overflow-y-auto border-t-2 border-linha">
                {manual && (
                  <li>
                    <Item disabled={salvando} onClick={() => escolher(null)}>
                      <span className="flex-1 font-medium">Voltar pra escolha automática</span>
                      <span className="text-xs text-apagado">pelos números</span>
                    </Item>
                  </li>
                )}
                {opcoes.map((opcao) => {
                  const eleMesmo = opcao.jogadorId === atual;
                  return (
                    <li key={opcao.jogadorId}>
                      <Item
                        disabled={salvando || eleMesmo}
                        onClick={() => escolher(opcao.jogadorId)}
                      >
                        <span className="w-8 font-numero text-base tracking-wide text-apagado">
                          {opcao.posicao ? POSICAO_SIGLA[opcao.posicao] : "–"}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {opcao.nome}
                          {eleMesmo && <span className="ml-2 text-xs text-apagado">(está aqui)</span>}
                        </span>
                        <span className="text-xs whitespace-nowrap text-apagado">
                          <span className="hidden sm:inline">Time {opcao.corTime} · </span>
                          {opcao.gols}G/{opcao.assistencias}A
                        </span>
                      </Item>
                    </li>
                  );
                })}
              </ul>

              {erro && (
                <p className="border-t-2 border-linha px-4 py-2 text-sm text-perigo">
                  Não rolou trocar. Tenta de novo.
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function Item({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition duration-150 hover:bg-superficie-2 focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-destaque disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  );
}
