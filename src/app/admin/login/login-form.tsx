"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { botaoPrimario, campo } from "@/lib/estilo";
import { Captcha } from "./captcha";

export function LoginForm({
  destino,
  captchaSiteKey,
}: {
  destino: string;
  captchaSiteKey?: string;
}) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const [captchaPronto, setCaptchaPronto] = useState(false);
  const esperandoCaptcha = captchaSiteKey !== undefined && !captchaPronto;

  return (
    // O token vai junto com o envio e não vale de novo: espera o widget gerar outro
    <form action={action} onSubmit={() => setCaptchaPronto(false)} className="space-y-4">
      <input type="hidden" name="destino" value={destino} />
      <div>
        <label htmlFor="senha" className="mb-1 block text-sm font-semibold">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className={campo}
        />
      </div>
      {captchaSiteKey && (
        <Captcha siteKey={captchaSiteKey} tentativa={state} onPronto={setCaptchaPronto} />
      )}
      {state.erro && (
        <p role="alert" className="text-sm text-perigo">
          {state.erro}
        </p>
      )}
      <button type="submit" disabled={pending || esperandoCaptcha}
        className={`${botaoPrimario} w-full`}
      >
        {pending ? "Entrando..." : esperandoCaptcha ? "Verificando..." : "Entrar"}
      </button>
    </form>
  );
}
