// Gera o PNG de uma cartinha a partir do próprio HTML dela (SVG <foreignObject> + canvas).
// O html-to-image entra por import dinâmico: só baixa quando alguém abre o menu da carta.

// Largura de saída que a gente mira pro PNG, boa pra mandar no grupo
const LARGURA_PNG = 700;

// O CSS das fontes é o passo mais caro (lê todas as folhas de estilo e baixa os .woff2);
// como ele é igual pra todas as cartas, vale guardar entre uma geração e outra.
let fonteCss: Promise<string> | null = null;

export async function cartaParaPng(carta: HTMLElement): Promise<Blob> {
  const { getFontEmbedCSS, toBlob } = await import("html-to-image");

  fonteCss ??= getFontEmbedCSS(carta).catch(() => "");

  // offsetWidth/Height em vez do tamanho em tela: se a carta estiver com o zoom
  // do hover, o retângulo medido sai maior do que ela realmente é
  const largura = carta.offsetWidth;

  const opcoes = {
    width: largura,
    height: carta.offsetHeight,
    // As cartas da seleção são bem menores na tela que as do elenco; a escala se
    // ajusta pra toda carta sair com ~LARGURA_PNG de largura, sem ficar serrilhada
    pixelRatio: Math.min(10, Math.max(3, LARGURA_PNG / largura)),
    fontEmbedCSS: await fonteCss,
  };

  // A primeira passada costuma sair sem as imagens (elas terminam de carregar
  // dentro do clone); a segunda, já com tudo em cache, sai completa.
  await toBlob(carta, opcoes);
  const blob = await toBlob(carta, opcoes);
  if (!blob) throw new Error("Falha ao gerar a imagem da carta");
  return blob;
}

export function nomeArquivoCarta(nome: string) {
  const slug = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `carta-${slug || "jogador"}.png`;
}
