"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cartaParaPng } from "@/lib/carta-imagem";
import { copiarTexto } from "@/lib/copiar-texto";
import { textoDoResumo } from "@/lib/texto-resumo";

type Estado =
  | "parado"
  | "gerando"
  // Compartilhar: o print ficou pronto mas o navegador perdeu o clique no caminho
  | "pronto"
  // Copiar: o print já foi, falta a mensagem
  | "falta-mensagem"
  | "feito"
  | "falhou";

const NOME_ARQUIVO = "selecao-do-fut.png";

// Se o navegador compartilha arquivo não muda com a página aberta: nada pra assinar
const nadaPraAssinar = () => () => {};
const podeCompartilhar = () =>
  navigator.canShare?.({ files: [new File([""], NOME_ARQUIVO, { type: "image/png" })] }) ?? false;

// O resumo do fut pro grupo: o print do campo da seleção com a mensagem (placar e MVP).
// O WhatsApp não cola texto e imagem juntos (com os dois na área de transferência, só a
// imagem entra), então:
// - onde dá pra compartilhar arquivo (celular), abre o compartilhar do sistema com o print
//   e a mensagem de legenda;
// - no resto (o Chrome no Linux, por exemplo) vai em dois cliques: copia o print, que vai
//   colado no WhatsApp, e depois a mensagem, que vai na legenda.
export function ResumoFut({
  futId,
  data,
  placarBranco,
  placarPreto,
  craque,
  idCampo,
  className,
}: {
  futId: string;
  data: string;
  placarBranco: number;
  placarPreto: number;
  craque: { nome: string; gols: number; assistencias: number } | null;
  // O campo da seleção é o que vira o print
  idCampo: string;
  className: string;
}) {
  // Só dá pra saber no navegador; no servidor fica o modo de copiar
  const compartilha = useSyncExternalStore(nadaPraAssinar, podeCompartilhar, () => false);
  const [estado, setEstado] = useState<Estado>("parado");
  // O PNG só fica guardado pro "Toca pra enviar": gerar de novo leva uns segundos. Fora
  // disso ele é descartado, que o campo pode mudar (troca de craque, por exemplo)
  const png = useRef<Blob | null>(null);

  // Os avisos somem sozinhos; o "falta a mensagem" espera mais, que é o tempo de colar o print
  useEffect(() => {
    if (estado === "parado" || estado === "gerando" || estado === "pronto") return;
    const timer = setTimeout(() => setEstado("parado"), estado === "falta-mensagem" ? 30000 : 2500);
    return () => clearTimeout(timer);
  }, [estado]);

  function texto() {
    return textoDoResumo(data, placarBranco, placarPreto, craque, `${location.origin}/selecao?fut=${futId}`);
  }

  async function gerarPng() {
    const campo = document.getElementById(idCampo);
    if (!campo) throw new Error("Campo da seleção não encontrado");
    png.current ??= await cartaParaPng(campo);
    return png.current;
  }

  async function compartilhar() {
    setEstado("gerando");
    try {
      const arquivo = new File([await gerarPng()], NOME_ARQUIVO, { type: "image/png" });
      await navigator.share({ files: [arquivo], text: texto() });
      png.current = null;
      setEstado("parado");
    } catch (erro) {
      const nome = erro instanceof DOMException ? erro.name : "";
      // AbortError: fechou o compartilhar sem mandar. NotAllowedError: gerar o print demorou
      // e o navegador não conta mais o toque como do usuário; com o PNG pronto, o próximo vai
      if (nome !== "NotAllowedError") png.current = null;
      setEstado(nome === "AbortError" ? "parado" : nome === "NotAllowedError" ? "pronto" : "falhou");
    }
  }

  async function copiarPrint() {
    setEstado("gerando");
    try {
      const blob = gerarPng();
      // Copiar imagem só existe em https e em navegador que aceite image/png; no resto baixa o PNG
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } else {
        const url = URL.createObjectURL(await blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = NOME_ARQUIVO;
        link.click();
        URL.revokeObjectURL(url);
      }
      setEstado("falta-mensagem");
    } catch {
      setEstado("falhou");
    } finally {
      png.current = null;
    }
  }

  async function copiarMensagem() {
    setEstado((await copiarTexto(texto())) ? "feito" : "falhou");
  }

  const aoClicar = compartilha
    ? compartilhar
    : estado === "falta-mensagem"
      ? copiarMensagem
      : copiarPrint;

  const rotulo =
    estado === "gerando"
      ? "Gerando…"
      : estado === "pronto"
        ? "Toca pra enviar"
        : estado === "falta-mensagem"
          ? "Agora a mensagem"
          : estado === "feito"
            ? "Mensagem copiada!"
            : estado === "falhou"
              ? "Não rolou"
              : compartilha
                ? "Compartilhar"
                : "Copiar print";

  return (
    <button type="button" onClick={aoClicar} disabled={estado === "gerando"} className={className}>
      <span aria-live="polite">{rotulo}</span>
    </button>
  );
}
