"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { botaoPrimario, campo } from "@/lib/estilo";

export function LoginForm({ destino }: { destino: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={action} className="space-y-4">
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
      {state.erro && (
        <p role="alert" className="text-sm text-perigo">
          {state.erro}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${botaoPrimario} w-full`}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
