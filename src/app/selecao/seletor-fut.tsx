"use client";

import { useRouter } from "next/navigation";
import { campo } from "@/lib/estilo";

export type OpcaoFut = { id: string; rotulo: string };

export function SeletorFut({ futs, atual }: { futs: OpcaoFut[]; atual: string }) {
  const router = useRouter();

  // Sem rótulo visível: a data e o placar já dizem o que é, e assim o campo fica
  // na mesma linha do "Ver fut". O h-11 com py-0 segura a altura do botão: com a
  // fonte maior o campo passaria dela
  return (
    <select
      aria-label="Fut"
      value={atual}
      onChange={(e) => router.push(`/selecao?fut=${encodeURIComponent(e.target.value)}`)}
      className={`${campo} h-11 min-w-0 flex-1 py-0 font-numero text-lg tracking-wide`}
    >
      {futs.map((fut) => (
        <option key={fut.id} value={fut.id}>
          {fut.rotulo}
        </option>
      ))}
    </select>
  );
}
