"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { criarJogador } from "@/data/jogadores";
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

export type CriarJogadorState = {
  erros?: Partial<Record<Campos, string[]>>;
  valores?: Record<Campos, string>;
};

export async function criarJogadorAction(
  _estadoAnterior: CriarJogadorState,
  formData: FormData,
): Promise<CriarJogadorState> {
  const valores = {
    nome: String(formData.get("nome") ?? ""),
    apelido: String(formData.get("apelido") ?? ""),
    numero: String(formData.get("numero") ?? ""),
    posicao: String(formData.get("posicao") ?? ""),
  };

  const resultado = novoJogadorSchema.safeParse(valores);
  if (!resultado.success) {
    return { erros: z.flattenError(resultado.error).fieldErrors, valores };
  }

  await criarJogador(resultado.data);
  revalidatePath("/jogadores");
  redirect("/jogadores");
}
