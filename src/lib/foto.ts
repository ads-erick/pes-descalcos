export const FOTO_LADO = 400;

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;

// Como a foto foi enquadrada: zoom em cima do maior quadrado que cabe na imagem
// e deslocamento do centro, em frações do lado desse recorte (independe do tamanho
// da tela, então serve tanto pro editor quanto pro canvas)
export type Recorte = { zoom: number; x: number; y: number };
export const RECORTE_PADRAO: Recorte = { zoom: 1, x: 0, y: 0 };

export type Imagem = { elemento: HTMLImageElement; url: string };

export async function abrirImagem(arquivo: File): Promise<Imagem> {
  const url = URL.createObjectURL(arquivo);
  const elemento = new Image();
  elemento.src = url;
  try {
    await elemento.decode();
  } catch (erro) {
    URL.revokeObjectURL(url);
    throw erro;
  }
  return { elemento, url };
}

const entre = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function ladoRecorte(imagem: HTMLImageElement, zoom: number) {
  return Math.min(imagem.naturalWidth, imagem.naturalHeight) / zoom;
}

// Segura o recorte dentro da imagem: nada de faixa vazia na beirada
export function limitarRecorte(imagem: HTMLImageElement, recorte: Recorte): Recorte {
  const zoom = entre(recorte.zoom, ZOOM_MIN, ZOOM_MAX);
  const lado = ladoRecorte(imagem, zoom);
  const sobraX = (imagem.naturalWidth / lado - 1) / 2;
  const sobraY = (imagem.naturalHeight / lado - 1) / 2;
  return { zoom, x: entre(recorte.x, -sobraX, sobraX), y: entre(recorte.y, -sobraY, sobraY) };
}

// Aplica o enquadramento e reduz, pra foto de celular (vários MB) virar ~40 KB
export async function recortarFoto(imagem: HTMLImageElement, recorte: Recorte): Promise<Blob> {
  const { zoom, x, y } = limitarRecorte(imagem, recorte);
  const lado = ladoRecorte(imagem, zoom);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = FOTO_LADO;
  canvas
    .getContext("2d")!
    .drawImage(
      imagem,
      (imagem.naturalWidth - lado) / 2 - x * lado,
      (imagem.naturalHeight - lado) / 2 - y * lado,
      lado,
      lado,
      0,
      0,
      FOTO_LADO,
      FOTO_LADO,
    );

  return await new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a foto"))),
      "image/jpeg",
      0.85,
    ),
  );
}
