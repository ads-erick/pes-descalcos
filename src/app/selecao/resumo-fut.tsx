"use client";

import { useEffect, useState } from "react";
import { cartaParaPng } from "@/lib/carta-imagem";
import { copiarTexto } from "@/lib/copiar-texto";
import { textoDoResumo } from "@/lib/texto-resumo";

type Estado = "parado" | "copiando" | "copiado" | "so-texto" | "falhou";

// O resumo do fut pro grupo: a mensagem (placar e MVP) e o print do campo da seleção,
// copiados juntos num clique. Se o navegador não aceitar imagem na área de transferência,
// copia só a mensagem.
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
  const [estado, setEstado] = useState<Estado>("parado");

  // Os avisos somem sozinhos, pra dar pra copiar de novo
  useEffect(() => {
    if (estado === "parado" || estado === "copiando") return;
    const timer = setTimeout(() => setEstado("parado"), 2500);
    return () => clearTimeout(timer);
  }, [estado]);

  async function copiar() {
    const link = `${location.origin}/selecao?fut=${futId}`;
    const texto = textoDoResumo(data, placarBranco, placarPreto, craque, link);
    const campo = document.getElementById(idCampo);
    setEstado("copiando");
    try {
      if (campo && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([texto], { type: "text/plain" }),
            "image/png": cartaParaPng(campo),
          }),
        ]);
        setEstado("copiado");
        return;
      }
    } catch {
      // cai pra cópia só do texto
    }
    setEstado((await copiarTexto(texto)) ? "so-texto" : "falhou");
  }

  return (
    <button type="button" onClick={copiar} disabled={estado === "copiando"} className={className}>
      <span aria-live="polite">
        {estado === "copiando"
          ? "Gerando…"
          : estado === "copiado"
            ? "Copiado!"
            : estado === "so-texto"
              ? "Copiei só o texto"
              : estado === "falhou"
                ? "Não deu pra copiar"
                : "Copiar resumo com print"}
      </span>
    </button>
  );
}
