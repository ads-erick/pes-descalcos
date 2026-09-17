// Aceita só caminhos internos ("/algo"), bloqueando "//site.com" e "/\site.com" (open redirect)
export function caminhoInterno(valor: unknown, fallback = "/jogadores") {
  return typeof valor === "string" && /^\/(?![/\\])/.test(valor)
    ? valor
    : fallback;
}
