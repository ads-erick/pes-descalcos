"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { atualizarJogador, criarJogador, excluirJogador } from "@/data/jogadores";
import { ehUuid } from "@/lib/id";
import { POSICOES } from "@/lib/jogador";

const vazioParaNull = (valor: unknown) =>
  typeof valor === "string" && valor.trim() === "" ? null : valor;

const novoJogadorSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome (mínimo 2 letras)").max(80, "Nome muito longo"),
  apelido: z.preprocess(vazioParaNull, z.string().trim().max(40, "Apelido muito longo").nullable()),
  numero: z.preprocess(
    vazioParaNull,
    z.coerce
      .number({ error: "Número inválido" })
      .int("Número inválido")
      .min(0, "Número inválido")
      .max(99, "Use um número de 0 a 99")
      .nullable(),
  ),
  posicao: z.preprocess(vazioParaNull, z.enum(POSICOES, { error: "Posição inválida" }).nullable()),
});

type Campos = keyof z.infer<typeof novoJogadorSchema>;

export type JogadorFormState = {
  erros?: Partial<Record<Campos, string[]>>;
  valores?: Record<Campos, string>;
};

function lerJogador(formData: FormData) {
  const valores = {
    nome: String(formData.get("nome") ?? ""),
    apelido: String(formData.get("apelido") ?? ""),
    numero: String(formData.get("numero") ?? ""),
    posicao: String(formData.get("posicao") ?? ""),
  };
  return { valores, resultado: novoJogadorSchema.safeParse(valores) };
}

export async function criarJogadorAction(
  _estadoAnterior: JogadorFormState,
  formData: FormData,
): Promise<JogadorFormState> {
  const { valores, resultado } = lerJogador(formData);
  if (!resultado.success) {
    return { erros: z.flattenError(resultado.error).fieldErrors, valores };
  }

  await criarJogador(resultado.data);
  revalidatePath("/jogadores");
  redirect("/jogadores");
}

export async function editarJogadorAction(
  _estadoAnterior: JogadorFormState,
  formData: FormData,
): Promise<JogadorFormState> {
  const id = formData.get("id");
  if (!ehUuid(id)) throw new Error("Jogador inválido");

  const { valores, resultado } = lerJogador(formData);
  if (!resultado.success) {
    return { erros: z.flattenError(resultado.error).fieldErrors, valores };
  }

  await atualizarJogador(id, resultado.data);
  revalidatePath("/jogadores");
  revalidatePath("/futs");
  redirect("/jogadores");
}

export async function excluirJogadorAction(formData: FormData) {
  const id = formData.get("id");
  if (!ehUuid(id)) throw new Error("Jogador inválido");

  await excluirJogador(id);
  revalidatePath("/jogadores");
  redirect("/jogadores");
}
