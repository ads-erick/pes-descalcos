"use server";

import { redirect } from "next/navigation";
import { checkPassword, endSession, startSession } from "@/data/auth";
import { captchaValido } from "@/data/captcha";
import { limparTentativas, registrarTentativa } from "@/data/login-limite";
import { caminhoInterno } from "@/lib/caminho";

export type LoginState = { erro?: string };

export async function loginAction(
  _estadoAnterior: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Antes do limite: sem passar pelo captcha, a tentativa nem conta
  if (!(await captchaValido(formData.get("cf-turnstile-response")))) {
    return { erro: "Não deu pra confirmar que você não é um robô. Tente de novo." };
  }

  const bloqueadoAte = await registrarTentativa();
  if (bloqueadoAte) {
    const minutos = Math.max(1, Math.ceil((bloqueadoAte.getTime() - Date.now()) / 60_000));
    return {
      erro: `Muitas tentativas erradas. Tente de novo em ${minutos} ${minutos === 1 ? "minuto" : "minutos"}.`,
    };
  }

  const senha = formData.get("senha");
  if (typeof senha !== "string" || !checkPassword(senha)) {
    return { erro: "Senha incorreta" };
  }

  await limparTentativas();
  await startSession();
  redirect(caminhoInterno(formData.get("destino")));
}

export async function logoutAction() {
  await endSession();
  redirect("/jogadores");
}
