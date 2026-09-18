"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { atualizarFut, criarFut, excluirFut, type NovaParticipacao, type NovoFut } from "@/data/futs";
import { ehUuid } from "@/lib/id";

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

export type FutFormState = { erro?: string };

function lerFut(formData: FormData): { erro: string } | { fut: NovoFut } {
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

  return { fut: { ...fut.data, participacoes } };
}

function revalidarFuts() {
  revalidatePath("/futs");
  revalidatePath("/jogadores");
}

export async function criarFutAction(
  _estadoAnterior: FutFormState,
  formData: FormData,
): Promise<FutFormState> {
  const lido = lerFut(formData);
  if ("erro" in lido) return lido;

  await criarFut(lido.fut);
  revalidarFuts();
  redirect("/futs");
}

export async function editarFutAction(
  _estadoAnterior: FutFormState,
  formData: FormData,
): Promise<FutFormState> {
  const id = formData.get("id");
  if (!ehUuid(id)) throw new Error("Fut inválido");

  const lido = lerFut(formData);
  if ("erro" in lido) return lido;

  await atualizarFut(id, lido.fut);
  revalidarFuts();
  redirect("/futs");
}

export async function excluirFutAction(formData: FormData) {
  const id = formData.get("id");
  if (!ehUuid(id)) throw new Error("Fut inválido");

  await excluirFut(id);
  revalidarFuts();
  redirect("/futs");
}
