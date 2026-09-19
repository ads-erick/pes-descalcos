"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { criarFutAction, editarFutAction, type FutFormState } from "@/app/futs/actions";
import type { NovoFut } from "@/data/futs";
import type { JogadorEscalavel } from "@/data/jogadores";
import { botaoPrimario, campo, campoPequeno, link, painel } from "@/lib/estilo";
import type { CorTime } from "@/lib/selecao";

type Time = CorTime;
type FutExistente = NovoFut & { id: string };

export function FutForm({
  jogadores,
  fut,
  timesSorteados,
  children,
}: {
  jogadores: JogadorEscalavel[];
  fut?: FutExistente;
  // Escalação vinda do sorteio de times, pra já abrir o formulário com todo mundo no seu time
  timesSorteados?: Record<string, Time>;
  children?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<FutFormState, FormData>(
    fut ? editarFutAction : criarFutAction,
    {},
  );
  const salvos = new Map(fut?.participacoes.map((p) => [p.jogadorId, p]));
  const [times, setTimes] = useState<Record<string, Time | "">>(
    () =>
      timesSorteados ??
      Object.fromEntries(fut?.participacoes.map((p) => [p.jogadorId, p.corTime]) ?? []),
  );

  return (
    <form action={action} className="space-y-6">
      {fut && <input type="hidden" name="id" value={fut.id} />}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="data" className="mb-1 block text-sm font-semibold">
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            required
            defaultValue={fut?.data ?? new Date().toISOString().slice(0, 10)}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="placarBranco" className="mb-1 block text-sm font-semibold">
            Gols branco
          </label>
          <input
            id="placarBranco"
            name="placarBranco"
            type="number"
            min={0}
            max={99}
            defaultValue={fut?.placarBranco ?? 0}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="placarPreto" className="mb-1 block text-sm font-semibold">
            Gols preto
          </label>
          <input
            id="placarPreto"
            name="placarPreto"
            type="number"
            min={0}
            max={99}
            defaultValue={fut?.placarPreto ?? 0}
            className={campo}
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Quem jogou</legend>
        <ul className={`divide-y-2 divide-linha ${painel}`}>
          {jogadores.map((jogador) => {
            const escalado = times[jogador.id] !== undefined && times[jogador.id] !== "";
            return (
              <li key={jogador.id} className="flex flex-wrap items-center gap-3 p-3">
                <label className="flex min-w-32 flex-1 items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="escalado"
                    value={jogador.id}
                    checked={escalado}
                    onChange={(e) =>
                      setTimes((atual) => ({
                        ...atual,
                        [jogador.id]: e.target.checked ? "branco" : "",
                      }))
                    }
                    className="size-4 accent-destaque"
                  />
                  {jogador.numero !== null && (
                    <span className="font-numero text-base text-apagado">{jogador.numero}</span>
                  )}
                  {jogador.nome}
                </label>

                {escalado && (
                  <div className="flex items-center gap-2">
                    <select
                      name={`time_${jogador.id}`}
                      value={times[jogador.id]}
                      onChange={(e) =>
                        setTimes((atual) => ({
                          ...atual,
                          [jogador.id]: e.target.value as Time,
                        }))
                      }
                      aria-label={`Time de ${jogador.nome}`}
                      className={campoPequeno}
                    >
                      <option value="branco">Branco</option>
                      <option value="preto">Preto</option>
                    </select>
                    <input
                      name={`gols_${jogador.id}`}
                      type="number"
                      min={0}
                      max={99}
                      defaultValue={salvos.get(jogador.id)?.gols ?? 0}
                      aria-label={`Gols de ${jogador.nome}`}
                      className={`w-16 ${campoPequeno}`}
                    />
                    <span className="text-xs text-apagado">G</span>
                    <input
                      name={`assistencias_${jogador.id}`}
                      type="number"
                      min={0}
                      max={99}
                      defaultValue={salvos.get(jogador.id)?.assistencias ?? 0}
                      aria-label={`Assistências de ${jogador.nome}`}
                      className={`w-16 ${campoPequeno}`}
                    />
                    <span className="text-xs text-apagado">A</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      {state.erro && (
        <p role="alert" className="text-sm text-perigo">
          {state.erro}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {children && <div className="mr-auto">{children}</div>}
        <Link href="/futs" className={`px-2 text-sm ${link}`}>
          Cancelar
        </Link>
        <button type="submit" disabled={pending} className={botaoPrimario}>
          {pending ? "Salvando..." : fut ? "Salvar alterações" : "Salvar fut"}
        </button>
      </div>
    </form>
  );
}
