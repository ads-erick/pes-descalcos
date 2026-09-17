"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { criarFut, type NovaParticipacao } from "@/data/futs";

const inteiroNaoNegativo = z.coerce
  .number({ error: "Valor inválido" })
  .int("Valor inválido")
  .min(0, "Valor inválido")
  .max(99, "Valor muito alto");

const futSchema = z.object({
  data: z.iso.date("Informe a data do fut"),
  placarBranco: inteiroNaoNegativo,
  placarPreto: inteiroNaoNegativo,
});

const participacaoSchema = z.object({
  jogadorId: z.uuid(),
  corTime: z.enum(["branco", "preto"], { error: "Escolha o time de cada jogador escalado" }),
  gols: inteiroNaoNegativo,
  assistencias: inteiroNaoNegativo,
});

export type CriarFutState = { erro?: string };

export async function criarFutAction(
  _estadoAnterior: CriarFutState,
  formData: FormData,
): Promise<CriarFutState> {
  const fut = futSchema.safeParse({
    data: formData.get("data"),
    placarBranco: formData.get("placarBranco") || 0,
    placarPreto: formData.get("placarPreto") || 0,
  });
  if (!fut.success) {
    return { erro: z.flattenError(fut.error).fieldErrors.data?.[0] ?? "Dados do fut inválidos" };
  }

  const participacoes: NovaParticipacao[] = [];
  for (const jogadorId of formData.getAll("escalado")) {
    const participacao = participacaoSchema.safeParse({
      jogadorId,
      corTime: formData.get(`time_${jogadorId}`),
      gols: formData.get(`gols_${jogadorId}`) || 0,
      assistencias: formData.get(`assistencias_${jogadorId}`) || 0,
    });
    if (!participacao.success) {
      return { erro: participacao.error.issues[0].message };
    }
    participacoes.push(participacao.data);
  }

  if (participacoes.length === 0) {
    return { erro: "Escale pelo menos um jogador" };
  }

  await criarFut({ ...fut.data, participacoes });
  revalidatePath("/futs");
  revalidatePath("/jogadores");
  redirect("/futs");
}
