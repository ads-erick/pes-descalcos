"use client";

import { useEffect, useState } from "react";
import { cartaParaPng } from "@/lib/carta-imagem";
import { copiarTexto } from "@/lib/copiar-texto";
import { textoDoResumo } from "@/lib/texto-resumo";

type Estado = "parado" | "copiando" | "copiado" | "baixado" | "falhou";

// O resumo do fut pro grupo: a mensagem (placar e MVP) e o print do campo da seleção.
// São dois botões porque o WhatsApp não cola texto e imagem juntos: cola um, depois o outro.
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
  const [mensagem, setMensagem] = useState<Estado>("parado");
  const [print, setPrint] = useState<Estado>("parado");

  // Os avisos somem sozinhos, pra dar pra copiar de novo
  useEffect(() => {
    if (mensagem !== "copiado" && mensagem !== "falhou") return;
    const timer = setTimeout(() => setMensagem("parado"), 2500);
    return () => clearTimeout(timer);
  }, [mensagem]);
  useEffect(() => {
    if (print === "parado" || print === "copiando") return;
    const timer = setTimeout(() => setPrint("parado"), 2500);
    return () => clearTimeout(timer);
  }, [print]);

  async function copiarMensagem() {
    const link = `${location.origin}/selecao?fut=${futId}`;
    const texto = textoDoResumo(data, placarBranco, placarPreto, craque, link);
    setMensagem((await copiarTexto(texto)) ? "copiado" : "falhou");
  }

  async function copiarPrint() {
    const campo = document.getElementById(idCampo);
    if (!campo) return setPrint("falhou");
    setPrint("copiando");
    try {
      // Copiar imagem só existe em https e em navegador que aceite image/png; no resto baixa o PNG
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": cartaParaPng(campo) })]);
        setPrint("copiado");
        return;
      }
      const url = URL.createObjectURL(await cartaParaPng(campo));
      const link = document.createElement("a");
      link.href = url;
      link.download = "selecao-da-semana.png";
      link.click();
      URL.revokeObjectURL(url);
      setPrint("baixado");
    } catch {
      setPrint("falhou");
    }
  }

  return (
    <>
      <button type="button" onClick={copiarMensagem} className={className}>
        <span aria-live="polite">
          {mensagem === "copiado"
            ? "Copiada!"
            : mensagem === "falhou"
              ? "Não deu pra copiar"
              : "Copiar mensagem"}
        </span>
      </button>
      <button type="button" onClick={copiarPrint} disabled={print === "copiando"} className={className}>
        <span aria-live="polite">
          {print === "copiando"
            ? "Gerando…"
            : print === "copiado"
              ? "Copiado!"
              : print === "baixado"
                ? "Baixado!"
                : print === "falhou"
                  ? "Não rolou gerar"
                  : "Copiar print"}
        </span>
      </button>
    </>
  );
}
