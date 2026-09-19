"use client";

import { useRouter } from "next/navigation";
import { campo } from "@/lib/estilo";

export type OpcaoFut = { id: string; rotulo: string };

export function SeletorFut({ futs, atual }: { futs: OpcaoFut[]; atual: string }) {
  const router = useRouter();

  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      Fut
      <select
        value={atual}
        onChange={(e) => router.push(`/selecao?fut=${encodeURIComponent(e.target.value)}`)}
        className={`${campo} font-numero text-lg tracking-wide sm:w-64`}
      >
        {futs.map((fut) => (
          <option key={fut.id} value={fut.id}>
            {fut.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}
