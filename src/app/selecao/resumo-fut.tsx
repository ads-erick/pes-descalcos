"use client";

import { useEffect, useState } from "react";
import { copiarTexto } from "@/lib/copiar-texto";
import { textoDoResumo, type Resumo } from "@/lib/texto-resumo";

type Estado = "parado" | "copiado" | "falhou";

// O resumo do fut pro grupo, só texto: o WhatsApp não cola texto e imagem juntos, então a
// seleção vai por escrito e o link leva pro site, onde tá o campo e as cartinhas
export function ResumoFut({
  resumo,
  className,
}: {
  // O link é montado aqui, que a origem (preview, produção, local) só o navegador sabe
  resumo: Omit<Resumo, "link">;
  className: string;
}) {
  const [estado, setEstado] = useState<Estado>("parado");

  // O aviso some sozinho, pra dar pra copiar de novo
  useEffect(() => {
    if (estado === "parado") return;
    const timer = setTimeout(() => setEstado("parado"), 2500);
    return () => clearTimeout(timer);
  }, [estado]);

  async function copiar() {
    const texto = textoDoResumo({ ...resumo, link: location.origin });
    setEstado((await copiarTexto(texto)) ? "copiado" : "falhou");
  }

  return (
    <button type="button" onClick={copiar} className={className}>
      <span aria-live="polite">
        {estado === "copiado" ? "Copiado!" : estado === "falhou" ? "Não deu pra copiar" : "Copiar resumo"}
      </span>
    </button>
  );
}
