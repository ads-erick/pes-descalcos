"use client";

import { useEffect, useState } from "react";
import type { Atuacao } from "@/lib/selecao";
import { copiarTexto } from "@/lib/copiar-texto";
import { textoDosTimes } from "@/lib/texto-times";

// Copia os dois times do fut que ainda vai rolar, prontos pra mandar no grupo do WhatsApp
export function BotaoCopiarTimes({
  futId,
  data,
  horario,
  atuacoes,
  className,
}: {
  futId: string;
  data: string;
  horario: string | null;
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
    const texto = textoDosTimes(data, horario, atuacoes, `${location.origin}/futs/${futId}`);
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
