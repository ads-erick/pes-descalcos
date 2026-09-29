"use client";

import { useEffect, useState } from "react";
import type { Atuacao } from "@/lib/selecao";
import { textoDosTimes } from "@/lib/texto-times";

// Copia os dois times do fut que ainda vai rolar, prontos pra mandar no grupo do WhatsApp
export function BotaoCopiarTimes({
  futId,
  data,
  atuacoes,
  className,
}: {
  futId: string;
  data: string;
  atuacoes: Pick<Atuacao, "nome" | "posicao" | "corTime">[];
  className: string;
}) {
  const [estado, setEstado] = useState<"parado" | "copiado" | "falhou">("parado");

  // O aviso some sozinho, pra dar pra copiar de novo
  useEffect(() => {
    if (estado === "parado") return;
    const timer = setTimeout(() => setEstado("parado"), 2500);
    return () => clearTimeout(timer);
  }, [estado]);

  async function copiar() {
    const texto = textoDosTimes(data, atuacoes, `${location.origin}/futs/${futId}`);
    setEstado((await copiarTexto(texto)) ? "copiado" : "falhou");
  }

  return (
    <button type="button" onClick={copiar} className={className}>
      <span aria-live="polite">
        {estado === "copiado" ? "Copiado!" : estado === "falhou" ? "Não deu pra copiar" : "Copiar times"}
      </span>
    </button>
  );
}

// A API do clipboard só existe em https (e localhost) e o navegador pode negar;
// aí vai pelo jeito antigo, selecionando um textarea escondido
async function copiarTexto(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const campo = document.createElement("textarea");
    campo.value = texto;
    campo.setAttribute("readonly", "");
    campo.style.position = "fixed";
    campo.style.opacity = "0";
    document.body.append(campo);
    campo.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      campo.remove();
    }
  }
}
