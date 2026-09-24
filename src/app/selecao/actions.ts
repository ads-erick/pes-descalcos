"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { escolherCraque } from "@/data/futs";
import { escolherVaga } from "@/data/selecao";
import { TOTAL_VAGAS } from "@/lib/selecao";

const trocaSchema = z.object({
  futId: z.uuid(),
  vaga: z.coerce.number().int().min(0).max(TOTAL_VAGAS - 1),
  // Vazio = voltar a vaga pra conta
  jogadorId: z.union([z.uuid(), z.literal("")]),
});

export async function trocarVaga(formData: FormData) {
  const troca = trocaSchema.safeParse({
    futId: formData.get("futId"),
    vaga: formData.get("vaga"),
    jogadorId: formData.get("jogadorId") ?? "",
  });
  if (!troca.success) return;

  const { futId, vaga, jogadorId } = troca.data;
  await escolherVaga(futId, vaga, jogadorId || null);
  revalidatePath("/selecao");
}

const craqueSchema = z.object({
  futId: z.uuid(),
  // Nulo = voltar pro craque da conta
  jogadorId: z.uuid().nullable(),
});

// Vai presa (bind) no menu de cada carta: futId e jogador chegam como argumentos
export async function trocarCraque(futId: string, jogadorId: string | null) {
  const troca = craqueSchema.safeParse({ futId, jogadorId });
  if (!troca.success) return;

  await escolherCraque(troca.data.futId, troca.data.jogadorId);
  revalidatePath("/selecao");
}
