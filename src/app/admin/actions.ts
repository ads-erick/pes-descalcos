"use server";

import { redirect } from "next/navigation";
import { checkPassword, endSession, startSession } from "@/data/auth";
import { caminhoInterno } from "@/lib/caminho";

export type LoginState = { erro?: string };

export async function loginAction(
  _estadoAnterior: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const senha = formData.get("senha");
  if (typeof senha !== "string" || !checkPassword(senha)) {
    return { erro: "Senha incorreta" };
  }

  await startSession();
  redirect(caminhoInterno(formData.get("destino")));
}

export async function logoutAction() {
  await endSession();
  redirect("/jogadores");
}
