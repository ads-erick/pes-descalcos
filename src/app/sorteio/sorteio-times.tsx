"use client";

import Link from "next/link";
import { useState } from "react";
import { botaoChip, botaoPrimario, botaoSecundario, faixaTime, painel } from "@/lib/estilo";
import { POSICAO_SIGLA, type Posicao } from "@/lib/jogador";
import { NOME_TIME, type CorTime } from "@/lib/selecao";
import { forca, sortearTimes, type Times } from "@/lib/sorteio";

type JogadorSorteavel = { id: string; nome: string; posicao: Posicao | null; nivel: number };

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
          <p className="text-sm font-semibold">
            Quem vai jogar{" "}
            <span className="font-normal text-apagado">
              ({confirmados.size} de {jogadores.length})
            </span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => marcar(new Set(jogadores.map((j) => j.id)))}
              className={botaoChip}
            >
              Marcar todos
            </button>
            <button type="button" onClick={() => marcar(new Set())} className={botaoChip}>
              Limpar
            </button>
          </div>
        </div>
        <ul className={`${painel} grid overflow-hidden sm:grid-cols-2`}>
          {jogadores.map((j) => (
            <li key={j.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-superficie-2 has-checked:bg-ouro-suave">
                <input
                  type="checkbox"
                  checked={confirmados.has(j.id)}
                  onChange={() => alternar(j.id)}
                  className="size-4 accent-destaque"
                />
                <span className="min-w-0 flex-1 truncate font-medium">{j.nome}</span>
                <span className="w-8 font-numero text-base tracking-wide text-apagado">
                  {j.posicao ? POSICAO_SIGLA[j.posicao] : "–"}
                </span>
                <span className="w-6 text-right font-numero text-xl leading-none">{j.nivel}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {confirmados.size < 2 && (
          <p className="mr-auto text-sm text-apagado">Marque pelo menos dois jogadores.</p>
        )}
        <button
          type="button"
          onClick={sortear}
          disabled={confirmados.size < 2}
          className={botaoPrimario}
        >
          {times ? "Sortear de novo" : "Sortear times"}
        </button>
      </div>

      {times && (
        <section aria-label="Times sorteados" className="space-y-4">
          <p className="text-center text-sm text-apagado">
            Diferença de força:{" "}
            <span className="font-numero text-xl text-tinta">
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
    <div className={`${painel} overflow-hidden`}>
      <h3
        className={`flex items-baseline justify-between px-4 pt-2 pb-1.5 font-numero text-xl tracking-wider uppercase ${faixaTime[cor]}`}
      >
        <span>
          {NOME_TIME[cor]}
          <span className="ml-2 opacity-60">({jogadores.length})</span>
        </span>
        <span className="text-base opacity-70">
          força <span className="text-xl opacity-100">{total}</span> · média{" "}
          {Math.round(total / jogadores.length)}
        </span>
      </h3>
      <ul className="divide-y divide-linha">
        {jogadores.map((j) => (
          <li key={j.id} className="flex items-center gap-3 px-4 py-2 text-sm">
            <span className="w-8 font-numero text-base tracking-wide text-apagado">
              {j.posicao ? POSICAO_SIGLA[j.posicao] : "–"}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{j.nome}</span>
            <span className="font-numero text-xl leading-none">{j.nivel}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
