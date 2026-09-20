// Classes repetidas entre as telas. As cores vêm dos tokens do tema (globals.css)
//
// Os botões saem todos das mesmas peças abaixo: o que muda entre eles é o
// tamanho e o preenchimento, nunca a animação, o foco ou o desabilitado.

const botaoBase =
  "inline-flex items-center justify-center gap-2 rounded-md font-numero leading-none tracking-wider uppercase transition duration-150";

// Anel de foco de teclado. O has-* cobre o <label> que embrulha um input escondido
const foco =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-destaque";

// Na faixa escura do cabeçalho o destaque some no fundo: lá o anel é dourado
const focoNaFaixa =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado";

// has-disabled: pro <label> cujo input está desabilitado
const desabilitado =
  "disabled:pointer-events-none disabled:opacity-60 has-disabled:pointer-events-none has-disabled:opacity-60";

// Sombra chapada, estilo impresso: cresce no hover e some ao apertar.
// Sem mexer na posição: um botão posicionado com translate (o "Editar" da lista
// de futs) perderia a centralização e pularia ao ser clicado.
const impresso =
  "shadow-[3px_3px_0_var(--sombra)] hover:shadow-[4px_4px_0_var(--sombra)] active:shadow-none";

// Um contorno só pro app inteiro; o que separa os botões é o tamanho
const contorno = "border-2 border-tinta bg-superficie hover:bg-tinta hover:text-fundo";
const contornoPerigo =
  "border-2 border-perigo bg-superficie text-perigo hover:bg-perigo hover:text-fundo";

// Alturas: a grande bate com a do campo de formulário, pra alinharem lado a lado
// Sem padding horizontal: cada botão põe o seu, senão dois px-* colidem
const grande = "h-11 pt-0.5 text-lg";
const medio = "h-9 pt-0.5 text-lg";
const pequeno = "h-8 pt-0.5 text-base";

const botao = `${botaoBase} ${foco} ${desabilitado} ${impresso}`;

// Ação principal da tela (salvar, registrar, sortear)
export const botaoPrimario = `${botao} ${grande} bg-destaque px-5 text-sobre-destaque`;

// Ação secundária ao lado da principal (cancelar, escolher foto)
export const botaoSecundario = `${botao} ${grande} px-4 ${contorno}`;

// Voltar / editar no topo das páginas
export const botaoPequeno = `${botao} ${medio} px-3 ${contorno}`;

// Ações pequenas dentro da tela (marcar todos, limpar)
export const botaoChip = `${botao} ${pequeno} px-2.5 ${contorno}`;

// Excluir: mesma forma dos outros, só que na cor de perigo
export const botaoPerigo = `${botao} ${grande} px-4 ${contornoPerigo}`;
export const botaoPerigoChip = `${botao} ${pequeno} px-2.5 ${contornoPerigo}`;

// Ações do cabeçalho (tema, entrar/sair): dourado, porque vivem na faixa escura
export const botaoNav = `${botaoBase} ${focoNaFaixa} ${desabilitado} ${impresso} ${medio} px-3 border-2 border-dourado/60 text-sobre-faixa hover:border-dourado hover:bg-dourado hover:text-sobre-dourado`;

// Grupo de botões colados (o seletor de período dos rankings)
export const grupoBotoes =
  "flex overflow-hidden rounded-md border-2 border-tinta font-numero text-lg leading-none tracking-wider uppercase";
// O anel fica pra dentro: o grupo tem overflow-hidden e cortaria um anel externo
export const grupoBotoesItem =
  "flex h-9 items-center px-3 pt-0.5 transition duration-150 hover:bg-superficie-2 focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-destaque";
export const grupoBotoesItemAtual = "bg-tinta text-fundo hover:bg-tinta";

// Cartinha crescendo de leve no hover (elenco e seleção)
export const zoomCarta =
  "block transition duration-200 ease-out hover:scale-105 focus-visible:scale-105";

export const link = `rounded-sm text-apagado underline-offset-4 transition duration-150 hover:text-tinta hover:underline ${foco}`;

export const campo =
  "w-full rounded-md border-2 border-linha bg-superficie px-3 py-2 transition duration-150 focus:border-destaque focus:outline-2 focus:outline-offset-2 focus:outline-destaque";

export const campoPequeno =
  "rounded-md border-2 border-linha bg-superficie px-2 py-1 text-sm transition duration-150 focus:border-destaque focus:outline-2 focus:outline-offset-2 focus:outline-destaque";

export const painel = "rounded-lg border-2 border-linha bg-superficie";
export const painelClicavel = `${painel} block transition duration-150 hover:border-destaque ${foco}`;

export const vazio =
  "rounded-lg border-2 border-dashed border-linha bg-superficie/60 p-8 text-center text-apagado";

// Sombra chapada fora dos botões (menu da carta, campo da seleção, tarjas)
export const sombraCartao = "shadow-[4px_4px_0_var(--sombra)]";
export const sombraTarja = "shadow-[2px_2px_0_var(--sombra)]";

// Título das páginas, no estilo do escudo: slab pesada, caixa alta
export const tituloPagina = "font-slab text-3xl leading-tight uppercase sm:text-4xl";

// Larguras de página. Cinco, mas cada uma com um motivo — e nomeadas, pra não
// nascerem valores novos no meio das telas
export const larguraLarga = "mx-auto w-full max-w-5xl px-4 py-8"; // grades de cartinhas e colunas
export const larguraForm = "mx-auto w-full max-w-4xl px-4 py-8"; // formulário + prévia lado a lado
export const larguraPadrao = "mx-auto w-full max-w-3xl px-4 py-8"; // listas, detalhes e formulários simples
export const larguraCampo = "mx-auto w-full max-w-7xl px-4 py-8"; // seleção: lista de um lado e o campo de fut7 do outro
export const larguraEstreita = "mx-auto w-full max-w-sm px-4 py-12"; // login

// Cabeçalho de cada lado no fut: o branco e o preto como as camisas.
// Fixos de propósito: são as cores das camisas, não do tema — não viram com ele.
export const faixaTime = {
  branco: "bg-[#f7f3ea] text-[#1e3163]",
  preto: "bg-[#0e0a0b] text-[#e2c26e]",
} as const;
