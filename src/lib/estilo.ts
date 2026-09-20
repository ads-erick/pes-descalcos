// Classes repetidas entre as telas. As cores vêm dos tokens do tema (globals.css)

// Botão com sombra chapada, estilo impresso: some ao apertar
export const botaoPrimario =
  "inline-flex items-center justify-center gap-2 rounded-md bg-destaque px-5 pt-2 pb-1.5 font-numero text-lg leading-none tracking-wider text-sobre-destaque uppercase shadow-[3px_3px_0_var(--sombra)] transition hover:-translate-y-px hover:shadow-[4px_4px_0_var(--sombra)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-60";

export const botaoSecundario =
  "inline-flex items-center justify-center gap-2 rounded-md border-2 border-tinta px-4 pt-1.5 pb-1 font-numero text-lg leading-none tracking-wider uppercase transition hover:bg-tinta hover:text-fundo";

// Ações do cabeçalho (tema, entrar/sair): com borda dourada pra parecer clicável
export const botaoNav =
  "inline-flex h-9 items-center gap-2 rounded-md border border-dourado/60 px-3 pt-0.5 font-numero text-lg leading-none tracking-wider text-sobre-faixa uppercase transition hover:border-dourado hover:bg-dourado hover:text-[#140f0a]";

// Voltar / editar no topo das páginas: pequeno, mas com cara de botão
export const botaoPequeno =
  "inline-flex h-9 items-center gap-1.5 rounded-md border-2 border-tinta/70 px-3 pt-0.5 font-numero text-lg leading-none tracking-wider uppercase transition hover:border-tinta hover:bg-tinta hover:text-fundo";

// Ações pequenas dentro da tela (marcar todos, limpar, ver no campo)
export const botaoChip =
  "inline-flex h-8 items-center gap-1.5 rounded-md border-2 border-linha bg-superficie px-2.5 pt-0.5 font-numero text-base leading-none tracking-wider uppercase transition hover:border-tinta hover:bg-tinta hover:text-fundo";

export const link = "text-apagado underline-offset-4 hover:text-tinta hover:underline";

export const campo =
  "w-full rounded-md border-2 border-linha bg-superficie px-3 py-2 outline-none transition focus:border-destaque";

export const campoPequeno =
  "rounded-md border-2 border-linha bg-superficie px-2 py-1 text-sm outline-none focus:border-destaque";

export const painel = "rounded-lg border-2 border-linha bg-superficie";

export const vazio =
  "rounded-lg border-2 border-dashed border-linha bg-superficie/60 p-8 text-center text-apagado";

// Cabeçalho de cada lado no fut: o branco e o preto como as camisas
export const faixaTime = {
  branco: "bg-[#f7f3ea] text-[#1e3163]",
  preto: "bg-[#0e0a0b] text-[#e2c26e]",
} as const;
