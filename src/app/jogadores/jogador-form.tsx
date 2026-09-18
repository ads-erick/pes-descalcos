"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  criarJogadorAction,
  editarJogadorAction,
  type JogadorFormState,
} from "@/app/jogadores/actions";
import type { NovoJogador } from "@/data/jogadores";
import { POSICAO_LABEL, POSICOES } from "@/lib/jogador";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900";

type JogadorExistente = NovoJogador & { id: string };

export function JogadorForm({
  jogador,
  children,
}: {
  jogador?: JogadorExistente;
  children?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<JogadorFormState, FormData>(
    jogador ? editarJogadorAction : criarJogadorAction,
    {},
  );
  // Depois de um erro de validação, mostra o que foi digitado, não o valor salvo
  const valores = state.valores ?? {
    nome: jogador?.nome ?? "",
    apelido: jogador?.apelido ?? "",
    numero: jogador?.numero?.toString() ?? "",
    posicao: jogador?.posicao ?? "",
  };

  return (
    <form action={action} className="space-y-4">
      {jogador && <input type="hidden" name="id" value={jogador.id} />}
      <Campo label="Nome" name="nome" erros={state.erros?.nome}>
        <input
          id="nome"
          name="nome"
          required
          maxLength={80}
          defaultValue={valores.nome}
          className={inputClass}
        />
      </Campo>

      <Campo label="Apelido (aparece na cartinha)" name="apelido" erros={state.erros?.apelido}>
        <input
          id="apelido"
          name="apelido"
          maxLength={40}
          defaultValue={valores.apelido}
          className={inputClass}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Número" name="numero" erros={state.erros?.numero}>
          <input
            id="numero"
            name="numero"
            type="number"
            inputMode="numeric"
            min={0}
            max={99}
            defaultValue={valores.numero}
            className={inputClass}
          />
        </Campo>

        <Campo label="Posição" name="posicao" erros={state.erros?.posicao}>
          <select
            id="posicao"
            name="posicao"
            defaultValue={valores.posicao}
            className={inputClass}
          >
            <option value="">–</option>
            {POSICOES.map((posicao) => (
              <option key={posicao} value={posicao}>
                {POSICAO_LABEL[posicao]}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {children && <div className="mr-auto">{children}</div>}
        <Link href="/jogadores" className="px-4 py-2 text-sm text-zinc-500 hover:underline">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

function Campo({
  label,
  name,
  erros,
  children,
}: {
  label: string;
  name: string;
  erros?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {erros?.[0] && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {erros[0]}
        </p>
      )}
    </div>
  );
}
