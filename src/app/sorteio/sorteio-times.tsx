"use client";

import Link from "next/link";
import { useState } from "react";
import { POSICAO_SIGLA, type Posicao } from "@/lib/jogador";
import type { CorTime } from "@/lib/selecao";
import { forca, sortearTimes, type Times } from "@/lib/sorteio";

type JogadorSorteavel = { id: string; nome: string; posicao: Posicao | null; nivel: number };

const NOME_TIME: Record<CorTime, string> = { branco: "Time branco", preto: "Time preto" };

const botaoSecundario =
  "rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";

export function SorteioTimes({
  jogadores,
  admin,
}: {
  jogadores: JogadorSorteavel[];
  admin: boolean;
}) {
  const [confirmados, setConfirmados] = useState<Set<string>>(new Set());
  const [times, setTimes] = useState<Times<JogadorSorteavel> | null>(null);

  // Mudou a lista, o sorteio anterior não vale mais
  function marcar(novos: Set<string>) {
    setConfirmados(novos);
    setTimes(null);
  }

  function alternar(id: string) {
    const novos = new Set(confirmados);
    if (novos.has(id)) novos.delete(id);
    else novos.add(id);
    marcar(novos);
  }

  function sortear() {
    setTimes(sortearTimes(jogadores.filter((j) => confirmados.has(j.id))));
  }

  const ids = (time: JogadorSorteavel[]) => time.map((j) => j.id).join(",");

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">
            Quem vai jogar{" "}
            <span className="text-zinc-500">
              ({confirmados.size} de {jogadores.length})
            </span>
          </p>
          <div className="flex gap-3 text-sm text-zinc-500">
            <button
              type="button"
              onClick={() => marcar(new Set(jogadores.map((j) => j.id)))}
              className="hover:underline"
            >
              Marcar todos
            </button>
            <button type="button" onClick={() => marcar(new Set())} className="hover:underline">
              Limpar
            </button>
          </div>
        </div>
        <ul className="grid rounded-xl border border-zinc-200 bg-white sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900">
          {jogadores.map((j) => (
            <li key={j.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <input
                  type="checkbox"
                  checked={confirmados.has(j.id)}
                  onChange={() => alternar(j.id)}
                  className="size-4"
                />
                <span className="min-w-0 flex-1 truncate font-medium">{j.nome}</span>
                <span className="w-8 text-xs font-semibold text-zinc-500">
                  {j.posicao ? POSICAO_SIGLA[j.posicao] : "–"}
                </span>
                <span className="w-6 text-right font-bold tabular-nums">{j.nivel}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {confirmados.size < 2 && (
          <p className="mr-auto text-sm text-zinc-500">Marque pelo menos dois jogadores.</p>
        )}
        <button
          type="button"
          onClick={sortear}
          disabled={confirmados.size < 2}
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {times ? "Sortear de novo" : "Sortear times"}
        </button>
      </div>

      {times && (
        <section aria-label="Times sorteados" className="space-y-4">
          <p className="text-center text-sm text-zinc-500">
            Diferença de força:{" "}
            <span className="font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
              {Math.abs(forca(times.branco) - forca(times.preto))}
            </span>{" "}
            (soma dos níveis de cada time)
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Time cor="branco" jogadores={times.branco} />
            <Time cor="preto" jogadores={times.preto} />
          </div>
          {admin && (
            <div className="flex justify-end">
              <Link
                href={`/futs/novo?branco=${ids(times.branco)}&preto=${ids(times.preto)}`}
                className={botaoSecundario}
              >
                Registrar fut com esses times
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Time({ cor, jogadores }: { cor: CorTime; jogadores: JogadorSorteavel[] }) {
  const total = forca(jogadores);
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <h3
        className={`flex items-baseline justify-between px-4 py-2 text-sm font-bold ${
          cor === "branco" ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white dark:bg-black"
        }`}
      >
        <span>
          {NOME_TIME[cor]}
          <span className="ml-2 font-normal opacity-70">({jogadores.length})</span>
        </span>
        <span className="font-normal opacity-70">
          força <span className="font-bold tabular-nums opacity-100">{total}</span> · média{" "}
          <span className="tabular-nums">{Math.round(total / jogadores.length)}</span>
        </span>
      </h3>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {jogadores.map((j) => (
          <li key={j.id} className="flex items-center gap-3 px-4 py-2 text-sm">
            <span className="w-8 text-xs font-semibold text-zinc-500">
              {j.posicao ? POSICAO_SIGLA[j.posicao] : "–"}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{j.nome}</span>
            <span className="font-bold tabular-nums">{j.nivel}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
