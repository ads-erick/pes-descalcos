"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  botaoPequeno,
  botaoPerigoPequeno,
  botaoPrimario,
  botaoSecundario,
  painel,
  sombraCartao,
} from "@/lib/estilo";
import {
  abrirImagem,
  limitarRecorte,
  ladoRecorte,
  recortarFoto,
  RECORTE_PADRAO,
  ZOOM_MAX,
  ZOOM_MIN,
  type Imagem,
  type Recorte,
} from "@/lib/foto";

// A foto escolhida agora: o original fica em memória pra dar pra reenquadrar
// sem ter que procurar o arquivo de novo
export type FotoEscolhida = { blob: Blob; url: string; imagem: Imagem; recorte: Recorte };

export function CampoFoto({
  escolhida,
  atual,
  iniciais,
  erroServidor,
  aoEscolher,
  aoRemover,
}: {
  escolhida: FotoEscolhida | null;
  atual: string | null;
  iniciais: string;
  erroServidor?: string;
  aoEscolher: (foto: FotoEscolhida) => void;
  aoRemover: () => void;
}) {
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  // Enquanto o editor está aberto, a foto ainda não foi aceita
  const [editando, setEditando] = useState<{ imagem: Imagem; recorte: Recorte } | null>(null);

  async function selecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;

    setAbrindo(true);
    setErro(null);
    try {
      const imagem = await abrirImagem(arquivo);
      setEditando({ imagem, recorte: RECORTE_PADRAO });
    } catch {
      setErro("Não deu pra abrir essa imagem. Tente uma foto JPG ou PNG.");
    } finally {
      setAbrindo(false);
    }
  }

  function fechar(imagem: Imagem) {
    // Só descarta o original se ele não for o da foto já aceita
    if (imagem !== escolhida?.imagem) URL.revokeObjectURL(imagem.url);
    setEditando(null);
  }

  async function confirmar(imagem: Imagem, recorte: Recorte) {
    const blob = await recortarFoto(imagem.elemento, recorte);
    aoEscolher({ blob, url: URL.createObjectURL(blob), imagem, recorte });
    setEditando(null);
  }

  const mensagem = erro ?? erroServidor;
  const trocar = atual ? "Trocar foto" : "Escolher foto";

  return (
    <div>
      {/* Sem rótulo: o avatar e os botões ao lado já dizem o que é */}
      <div className="flex items-center gap-4">
        {/* O próprio círculo abre a escolha do arquivo. O "trocar foto" aparece por
            cima no hover, no foco de teclado e enquanto o dedo aperta; o selo da
            câmera fica sempre, porque no celular não tem hover pra avisar */}
        <label className="group relative size-20 shrink-0 cursor-pointer rounded-full has-disabled:pointer-events-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-destaque">
          <span className="grid size-full place-items-center overflow-hidden rounded-full border-2 border-linha bg-superficie-2 font-slab text-2xl text-apagado">
            {atual ? (
              <Image
                src={atual}
                alt=""
                width={80}
                height={80}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              iniciais
            )}
          </span>

          {/* Véu preto fixo, como o do editor: a foto pode ser clara ou escura */}
          <span
            className={`absolute inset-0 grid place-items-center rounded-full bg-black/60 px-2 text-center font-numero text-sm leading-tight tracking-wider text-white uppercase transition duration-150 group-hover:opacity-100 group-active:opacity-100 group-has-focus-visible:opacity-100 ${abrindo ? "opacity-100" : "opacity-0"}`}
          >
            {abrindo ? "Abrindo..." : trocar}
          </span>

          <span
            aria-hidden="true"
            className="absolute -right-0.5 -bottom-0.5 grid size-7 place-items-center rounded-full border-2 border-superficie bg-destaque text-sobre-destaque"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </span>

          <input
            id="foto"
            type="file"
            accept="image/*"
            aria-label={atual ? "Trocar a foto do jogador" : "Escolher a foto do jogador"}
            onChange={selecionar}
            disabled={abrindo}
            className="sr-only"
          />
        </label>

        {/* Todos do mesmo tamanho e na mesma linha; só quebram se não couberem */}
        <div className="flex flex-wrap items-center gap-2">
          {!atual && <p className="text-sm text-apagado">Clique ou toque no círculo pra pôr uma foto.</p>}
          {escolhida && (
            <button
              type="button"
              onClick={() => setEditando({ imagem: escolhida.imagem, recorte: escolhida.recorte })}
              className={botaoPequeno}
            >
              Enquadrar
            </button>
          )}
          {atual && (
            <button type="button" onClick={aoRemover} className={botaoPerigoPequeno}>
              Remover
            </button>
          )}
        </div>
      </div>

      {mensagem && (
        <p role="alert" className="mt-2 text-sm text-perigo">
          {mensagem}
        </p>
      )}

      {editando && (
        <EditorFoto
          imagem={editando.imagem}
          recorteInicial={editando.recorte}
          aoCancelar={() => fechar(editando.imagem)}
          aoConfirmar={(recorte) => confirmar(editando.imagem, recorte)}
        />
      )}
    </div>
  );
}

// Enquadramento: arrastar pra mover, pinça/roda/barra pra aproximar.
// O quadrado da tela é exatamente o que vira a foto salva.
function EditorFoto({
  imagem,
  recorteInicial,
  aoCancelar,
  aoConfirmar,
}: {
  imagem: Imagem;
  recorteInicial: Recorte;
  aoCancelar: () => void;
  aoConfirmar: (recorte: Recorte) => void | Promise<void>;
}) {
  const [recorte, setRecorte] = useState(() => limitarRecorte(imagem.elemento, recorteInicial));
  const [salvando, setSalvando] = useState(false);
  // Onde cada dedo/ponteiro está agora, pra arrastar com um e dar pinça com dois
  const ponteiros = useRef(new Map<number, { x: number; y: number }>());

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && aoCancelar();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoCancelar]);

  const ajustar = (mudanca: Partial<Recorte>) =>
    setRecorte((atual) => limitarRecorte(imagem.elemento, { ...atual, ...mudanca }));

  // Move em frações do lado do recorte, que é o que o quadrado da tela mostra
  const mover = (dx: number, dy: number, lado: number) =>
    setRecorte((atual) =>
      limitarRecorte(imagem.elemento, {
        ...atual,
        x: atual.x + dx / lado,
        y: atual.y + dy / lado,
      }),
    );

  function aoPressionar(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  function aoMover(e: React.PointerEvent<HTMLDivElement>) {
    const anteriores = ponteiros.current;
    if (!anteriores.has(e.pointerId)) return;
    const lado = e.currentTarget.getBoundingClientRect().width;
    const antes = [...anteriores.values()];

    anteriores.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const depois = [...anteriores.values()];

    if (antes.length === 1) {
      mover(e.clientX - antes[0].x, e.clientY - antes[0].y, lado);
      return;
    }
    // Pinça: o zoom acompanha o quanto a distância entre os dois dedos cresceu
    const distancia = (p: { x: number; y: number }[]) => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    const proporcao = distancia(depois) / (distancia(antes) || 1);
    if (Number.isFinite(proporcao) && proporcao > 0) ajustar({ zoom: recorte.zoom * proporcao });
  }

  function aoSoltar(e: React.PointerEvent<HTMLDivElement>) {
    ponteiros.current.delete(e.pointerId);
  }

  async function confirmar() {
    setSalvando(true);
    await aoConfirmar(recorte);
  }

  // Posição da imagem dentro do quadrado, tudo em % do lado — não precisa medir a tela
  const lado = ladoRecorte(imagem.elemento, recorte.zoom);
  const largura = (imagem.elemento.naturalWidth / lado) * 100;
  const altura = (imagem.elemento.naturalHeight / lado) * 100;

  // Véu preto fixo (não o token da tinta): ele cobre a página nos dois temas
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Enquadrar a foto"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onPointerDown={(e) => e.target === e.currentTarget && aoCancelar()}
    >
      <div className={`${painel} ${sombraCartao} w-full max-w-sm p-4`}>
        <h2 className="mb-1 font-slab text-lg uppercase">Enquadrar a foto</h2>
        <p className="mb-3 text-sm text-apagado">
          Arraste pra centralizar. A barra (ou a pinça, no celular) aproxima.
        </p>

        <div
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          onWheel={(e) => ajustar({ zoom: recorte.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1) })}
          className="relative aspect-square w-full touch-none overflow-hidden rounded-md border-2 border-linha bg-superficie-2 select-none"
        >
          {/* <img> cru: é um blob: local, o otimizador do Next não entra aqui */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagem.url}
            alt=""
            draggable={false}
            className="absolute max-w-none cursor-grab active:cursor-grabbing"
            style={{
              width: `${largura}%`,
              height: `${altura}%`,
              left: `${50 - largura / 2 + recorte.x * 100}%`,
              top: `${50 - altura / 2 + recorte.y * 100}%`,
            }}
          />
          {/* Guia: o quadrado é o que fica salvo, o círculo é o avatar da lista */}
          <div className="pointer-events-none absolute inset-1 rounded-full border border-dashed border-white/60 mix-blend-difference" />
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm">
          <span className="font-semibold">Zoom</span>
          <input
            type="range"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={0.01}
            value={recorte.zoom}
            onChange={(e) => ajustar({ zoom: Number(e.target.value) })}
            className="h-2 w-full accent-destaque"
          />
        </label>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setRecorte(RECORTE_PADRAO)}
            className="mr-auto text-sm text-apagado underline-offset-4 hover:underline"
          >
            Redefinir
          </button>
          <button type="button" onClick={aoCancelar} className={botaoSecundario}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={salvando}
            className={botaoPrimario}
          >
            {salvando ? "Cortando..." : "Usar foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
