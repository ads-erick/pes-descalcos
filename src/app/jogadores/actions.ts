"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { FOTO_TAMANHO_MAX, FOTO_TIPOS } from "@/data/fotos";
import { atualizarJogador, criarJogador, excluirJogador, type MudancaFoto } from "@/data/jogadores";
import { ehUuid } from "@/lib/id";
import { POSICOES } from "@/lib/jogador";
import { NIVEL_MAX, NIVEL_MIN } from "@/lib/nivel";

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
  nivelBase: z.coerce
    .number({ error: "Nível inválido" })
    .int("Nível inválido")
    .min(NIVEL_MIN, `Use um nível de ${NIVEL_MIN} a ${NIVEL_MAX}`)
    .max(NIVEL_MAX, `Use um nível de ${NIVEL_MIN} a ${NIVEL_MAX}`),
});

type Campos = keyof z.infer<typeof novoJogadorSchema>;

export type JogadorFormState = {
  erros?: Partial<Record<Campos | "foto", string[]>>;
  valores?: Record<Campos, string>;
};

function lerJogador(formData: FormData) {
  const valores = {
    nome: String(formData.get("nome") ?? ""),
    apelido: String(formData.get("apelido") ?? ""),
    numero: String(formData.get("numero") ?? ""),
    posicao: String(formData.get("posicao") ?? ""),
    nivelBase: String(formData.get("nivelBase") ?? ""),
  };
  return { valores, resultado: novoJogadorSchema.safeParse(valores) };
}

// O navegador já manda a foto reduzida; aqui só confere se veio algo aceitável
function lerFoto(formData: FormData): { foto: MudancaFoto; erro?: string } {
  if (formData.get("removerFoto") === "on") return { foto: "remover" };

  const foto = formData.get("foto");
  if (!(foto instanceof File) || foto.size === 0) return { foto: null };
  if (!(FOTO_TIPOS as readonly string[]).includes(foto.type)) {
    return { foto: null, erro: "Use uma foto JPG, PNG ou WebP" };
  }
  if (foto.size > FOTO_TAMANHO_MAX) return { foto: null, erro: "Foto muito grande (máximo 1 MB)" };
  return { foto };
}

function validar(formData: FormData) {
  const { valores, resultado } = lerJogador(formData);
  const { foto, erro } = lerFoto(formData);
  if (!resultado.success || erro) {
    const erros = resultado.success ? {} : z.flattenError(resultado.error).fieldErrors;
    return { estado: { erros: { ...erros, ...(erro && { foto: [erro] }) }, valores } };
  }
  return { dados: resultado.data, foto };
}

export async function criarJogadorAction(
  _estadoAnterior: JogadorFormState,
  formData: FormData,
): Promise<JogadorFormState> {
  const { estado, dados, foto } = validar(formData);
  if (estado) return estado;

  await criarJogador(dados, foto === "remover" ? null : foto);
  revalidatePath("/jogadores");
  redirect("/jogadores");
}

export async function editarJogadorAction(
  _estadoAnterior: JogadorFormState,
  formData: FormData,
): Promise<JogadorFormState> {
  const id = formData.get("id");
  if (!ehUuid(id)) throw new Error("Jogador inválido");

  const { estado, dados, foto } = validar(formData);
  if (estado) return estado;

  // O campo vem preenchido com o nível atual da carta; só conta como troca se mudou
  const mudouNivel = String(dados.nivelBase) !== formData.get("nivelAtual");
  await atualizarJogador(id, dados, foto, mudouNivel);
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
