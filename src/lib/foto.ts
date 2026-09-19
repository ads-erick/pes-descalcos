export const FOTO_LADO = 400;

// Recorta o centro num quadrado e reduz, pra foto de celular (vários MB) virar ~40 KB
export async function reduzirFoto(arquivo: File): Promise<Blob> {
  const url = URL.createObjectURL(arquivo);
  try {
    const imagem = new Image();
    imagem.src = url;
    await imagem.decode();

    const lado = Math.min(imagem.naturalWidth, imagem.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = FOTO_LADO;
    canvas
      .getContext("2d")!
      .drawImage(
        imagem,
        (imagem.naturalWidth - lado) / 2,
        (imagem.naturalHeight - lado) / 2,
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
  } finally {
    URL.revokeObjectURL(url);
  }
}
