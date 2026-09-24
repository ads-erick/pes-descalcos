"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cartaParaPng, nomeArquivoCarta } from "@/lib/carta-imagem";
import { painel, sombraCartao } from "@/lib/estilo";

type Posicao = { x: number; y: number };
type Estado = "parado" | "copiando" | "baixando" | "copiado" | "erro" | "salvando" | "erroSalvar";

// Ação a mais no menu, depois de copiar/baixar (ex.: "Tornar craque" na seleção)
export type AcaoCarta = { rotulo: string; acao: () => Promise<void> };

const LARGURA = 208; // w-52, pra não deixar o menu sair da tela
const TOQUE_LONGO_MS = 500;
// Arrastar o dedo além disso é rolagem, não toque longo
const TOLERANCIA_PX = 10;

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
  // Vai na div que vira a imagem: é assim que a tarja de craque entra no PNG
  className,
  acoes = [],
  children,
}: {
  nome: string;
  sufixo?: string;
  className?: string;
  acoes?: AcaoCarta[];
  children: ReactNode;
}) {
  const carta = useRef<HTMLDivElement>(null);
  const toque = useRef<{ timer: number; x: number; y: number } | null>(null);
  // O toque longo termina em clique, que abriria o link da carta
  const engolirClique = useRef(false);
  const [menu, setMenu] = useState<Posicao | null>(null);
  const [estado, setEstado] = useState<Estado>("parado");
  const [copiavel, setCopiavel] = useState(false);

  useEffect(() => cancelarToque, []);

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

  function abrirEm(x: number, y: number) {
    setEstado("parado");
    setCopiavel(podeCopiar());
    setMenu({ x, y });
  }

  // Mouse: botão direito
  function abrir(evento: React.MouseEvent) {
    evento.preventDefault();
    abrirEm(evento.clientX, evento.clientY);
  }

  function cancelarToque() {
    if (!toque.current) return;
    clearTimeout(toque.current.timer);
    toque.current = null;
  }

  // Celular: não existe botão direito e o toque simples é o link da carta,
  // então meio segundo segurando abre o mesmo menu
  function iniciarToque(evento: React.PointerEvent) {
    if (evento.pointerType === "mouse") return;
    cancelarToque();
    engolirClique.current = false;
    const { clientX: x, clientY: y } = evento;
    toque.current = {
      x,
      y,
      timer: window.setTimeout(() => {
        toque.current = null;
        engolirClique.current = true;
        abrirEm(x, y);
      }, TOQUE_LONGO_MS),
    };
  }

  function moverToque(evento: React.PointerEvent) {
    const inicio = toque.current;
    if (!inicio) return;
    if (
      Math.abs(evento.clientX - inicio.x) > TOLERANCIA_PX ||
      Math.abs(evento.clientY - inicio.y) > TOLERANCIA_PX
    ) {
      cancelarToque();
    }
  }

  function engolir(evento: React.MouseEvent) {
    if (!engolirClique.current) return;
    engolirClique.current = false;
    evento.preventDefault();
    evento.stopPropagation();
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

  async function executar(acao: () => Promise<void>) {
    setEstado("salvando");
    try {
      await acao();
      setMenu(null);
    } catch {
      setEstado("erroSalvar");
    }
  }

  const ocupado = estado === "copiando" || estado === "baixando" || estado === "salvando";

  return (
    <>
      {/* touch-callout: sem isso o iPhone abre o menu dele ("abrir link", "salvar
          imagem") por cima do nosso no toque longo */}
      <div
        ref={carta}
        onContextMenu={abrir}
        onPointerDown={iniciarToque}
        onPointerMove={moverToque}
        onPointerUp={cancelarToque}
        onPointerCancel={cancelarToque}
        onClickCapture={engolir}
        className={`select-none [-webkit-touch-callout:none] ${className ?? ""}`}
      >
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
              // Uns 40px por item: o menu não passa do fim da tela
              top: Math.min(menu.y, window.innerHeight - 16 - 40 * (2 + acoes.length)),
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
            {acoes.map(({ rotulo, acao }) => (
              <ItemMenu key={rotulo} onClick={() => executar(acao)} disabled={ocupado}>
                {estado === "salvando" ? "Salvando…" : rotulo}
              </ItemMenu>
            ))}
            {estado === "erro" && (
              <p className="px-3 pt-1 pb-0.5 text-xs text-perigo">Não rolou gerar a imagem.</p>
            )}
            {estado === "erroSalvar" && (
              <p className="px-3 pt-1 pb-0.5 text-xs text-perigo">Não rolou salvar. Tenta de novo.</p>
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
      className="block w-full px-3 py-2.5 text-left font-numero text-lg leading-none tracking-wider uppercase transition duration-150 hover:bg-tinta hover:text-fundo focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-destaque disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  );
}
