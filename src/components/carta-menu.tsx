"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cartaParaPng, nomeArquivoCarta } from "@/lib/carta-imagem";
import { painel, sombraCartao } from "@/lib/estilo";

type Posicao = { x: number; y: number };
type Estado = "parado" | "copiando" | "baixando" | "copiado" | "erro";

const LARGURA = 208; // w-52, pra não deixar o menu sair da tela

// Copiar imagem só existe em contexto seguro (https ou localhost) e em navegador
// que aceite image/png no clipboard — no resto, sobra só o download
function podeCopiar() {
  return (
    typeof ClipboardItem !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.clipboard?.write &&
    (ClipboardItem.supports?.("image/png") ?? true)
  );
}

export function CartaMenu({
  nome,
  // Entra no nome do arquivo pra carta da seleção não colidir com a do elenco
  sufixo,
  children,
}: {
  nome: string;
  sufixo?: string;
  children: ReactNode;
}) {
  const carta = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<Posicao | null>(null);
  const [estado, setEstado] = useState<Estado>("parado");
  const [copiavel, setCopiavel] = useState(false);

  // Fecha o menu ao clicar fora, rolar a página ou apertar Esc
  useEffect(() => {
    if (!menu) return;
    const fechar = () => setMenu(null);
    const naTecla = (evento: KeyboardEvent) => evento.key === "Escape" && fechar();
    window.addEventListener("pointerdown", fechar);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("resize", fechar);
    window.addEventListener("keydown", naTecla);
    return () => {
      window.removeEventListener("pointerdown", fechar);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("resize", fechar);
      window.removeEventListener("keydown", naTecla);
    };
  }, [menu]);

  function abrir(evento: React.MouseEvent) {
    evento.preventDefault();
    setEstado("parado");
    setCopiavel(podeCopiar());
    setMenu({ x: evento.clientX, y: evento.clientY });
  }

  async function copiar() {
    if (!carta.current) return;
    setEstado("copiando");
    try {
      // O blob vai como promessa: alguns navegadores só liberam a área de
      // transferência se o write() sair no mesmo passo do clique
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": cartaParaPng(carta.current) }),
      ]);
      setEstado("copiado");
      setTimeout(() => setMenu(null), 900);
    } catch {
      setEstado("erro");
    }
  }

  async function baixar() {
    if (!carta.current) return;
    setEstado("baixando");
    try {
      const url = URL.createObjectURL(await cartaParaPng(carta.current));
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivoCarta(sufixo ? `${nome} ${sufixo}` : nome);
      link.click();
      URL.revokeObjectURL(url);
      setMenu(null);
    } catch {
      setEstado("erro");
    }
  }

  const ocupado = estado === "copiando" || estado === "baixando";

  return (
    <>
      <div ref={carta} onContextMenu={abrir}>
        {children}
      </div>

      {menu &&
        createPortal(
          <div
            role="menu"
            aria-label={`Ações da carta de ${nome}`}
            // O menu vive no body: clicar nele não dispara o link da carta
            onPointerDown={(evento) => evento.stopPropagation()}
            onContextMenu={(evento) => evento.preventDefault()}
            className={`${painel} ${sombraCartao} fixed z-50 w-52 overflow-hidden py-1 text-sm`}
            style={{
              left: Math.min(menu.x, window.innerWidth - LARGURA - 8),
              top: Math.min(menu.y, window.innerHeight - 96),
            }}
          >
            {copiavel && (
              <ItemMenu onClick={copiar} disabled={ocupado}>
                {estado === "copiando"
                  ? "Copiando…"
                  : estado === "copiado"
                    ? "Copiada!"
                    : "Copiar carta"}
              </ItemMenu>
            )}
            <ItemMenu onClick={baixar} disabled={ocupado}>
              {estado === "baixando" ? "Gerando…" : "Baixar carta (PNG)"}
            </ItemMenu>
            {estado === "erro" && (
              <p className="px-3 pt-1 pb-0.5 text-xs text-perigo">Não rolou gerar a imagem.</p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

function ItemMenu({
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
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className="block w-full px-3 py-2 text-left font-numero text-lg leading-none tracking-wider uppercase transition duration-150 hover:bg-tinta hover:text-fundo focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-destaque disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  );
}
