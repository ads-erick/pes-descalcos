"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { criarFutAction, editarFutAction, type FutFormState } from "@/app/futs/actions";
import type { NovoFut } from "@/data/futs";
import type { JogadorEscalavel } from "@/data/jogadores";
import {
  botaoChip,
  botaoContador,
  botaoPrimario,
  botaoSecundario,
  campo,
  campoPequeno,
  faixaTime,
  link,
  painel,
} from "@/lib/estilo";
import { POSICAO_SIGLA, normalizar } from "@/lib/jogador";
import { NOME_TIME, type CorTime } from "@/lib/selecao";

type Time = CorTime;
type FutExistente = NovoFut & { id: string };
type Linha = { jogadorId: string; corTime: Time; gols: number; assistencias: number };

const TIMES = ["branco", "preto"] as const;
const OUTRO: Record<Time, Time> = { branco: "preto", preto: "branco" };
const MAXIMO = 99;

const limitar = (n: number) => Math.min(MAXIMO, Math.max(0, n));

// Na ordem do elenco (por nome); quem entrar depois vai pro fim da tabela do time
function linhasIniciais(
  jogadores: JogadorEscalavel[],
  fut?: FutExistente,
  timesSorteados?: Record<string, Time>,
): Linha[] {
  const salvos = new Map(fut?.participacoes.map((p) => [p.jogadorId, p]));
  return jogadores.flatMap((j) => {
    const salvo = salvos.get(j.id);
    const corTime = timesSorteados?.[j.id] ?? salvo?.corTime;
    if (!corTime) return [];
    return [{ jogadorId: j.id, corTime, gols: salvo?.gols ?? 0, assistencias: salvo?.assistencias ?? 0 }];
  });
}

function somaDosGols(linhas: Linha[]): Record<Time, number> {
  const soma = { branco: 0, preto: 0 };
  for (const l of linhas) soma[l.corTime] += l.gols;
  return soma;
}

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
  const porId = new Map(jogadores.map((j) => [j.id, j]));
  const [linhas, setLinhas] = useState(() => linhasIniciais(jogadores, fut, timesSorteados));
  const soma = somaDosGols(linhas);

  // null = o placar daquele lado vai somando os gols lançados nos jogadores. Mexeu na mão,
  // vira número fixo (gol contra, gol de quem não é do elenco). Fut salvo cujo placar já
  // batia com a soma continua somando
  const [placarFixo, setPlacarFixo] = useState<Record<Time, number | null>>(() => {
    if (!fut) return { branco: null, preto: null };
    const salva = somaDosGols(linhasIniciais(jogadores, fut));
    return {
      branco: fut.placarBranco === salva.branco ? null : fut.placarBranco,
      preto: fut.placarPreto === salva.preto ? null : fut.placarPreto,
    };
  });
  const placar = (cor: Time) => placarFixo[cor] ?? soma[cor];
  const fixarPlacar = (cor: Time, valor: number | null) =>
    setPlacarFixo((atual) => ({ ...atual, [cor]: valor === null ? null : limitar(valor) }));

  // Só um jogador com as opções abertas por vez
  const [opcoesDe, setOpcoesDe] = useState<string | null>(null);

  function mudar(jogadorId: string, mudanca: Partial<Linha>) {
    setLinhas((atual) => atual.map((l) => (l.jogadorId === jogadorId ? { ...l, ...mudanca } : l)));
  }

  function adicionar(jogadorId: string, corTime: Time) {
    setLinhas((atual) => [...atual, { jogadorId, corTime, gols: 0, assistencias: 0 }]);
  }

  function tirar(jogadorId: string) {
    setLinhas((atual) => atual.filter((l) => l.jogadorId !== jogadorId));
    setOpcoesDe(null);
  }

  const escalados = new Set(linhas.map((l) => l.jogadorId));
  const disponiveis = jogadores.filter((j) => !escalados.has(j.id));

  return (
    <form action={action} className="space-y-8">
      {fut && <input type="hidden" name="id" value={fut.id} />}

      <section className={`${painel} px-4 py-6`}>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <label htmlFor="data" className="font-numero text-xl tracking-wider uppercase">
            Fut de
          </label>
          <input
            id="data"
            name="data"
            type="date"
            required
            defaultValue={fut?.data ?? new Date().toISOString().slice(0, 10)}
            className={`${campo} max-w-48`}
          />
        </div>

        <div className="mx-auto mt-6 grid max-w-72 grid-cols-2 text-center font-numero text-xl tracking-wider uppercase">
          {TIMES.map((cor) => (
            <label key={cor} htmlFor={`placar-${cor}`} className="capitalize">
              {cor}
            </label>
          ))}
        </div>
        <div className="mx-auto mt-1 flex max-w-72 overflow-hidden rounded-md border-2 border-tinta">
          {TIMES.map((cor) => (
            <input
              key={cor}
              id={`placar-${cor}`}
              name={cor === "branco" ? "placarBranco" : "placarPreto"}
              type="number"
              min={0}
              max={MAXIMO}
              inputMode="numeric"
              value={placar(cor)}
              onChange={(e) => fixarPlacar(cor, Number.parseInt(e.target.value, 10) || 0)}
              onFocus={(e) => e.target.select()}
              className={`w-1/2 [appearance:textfield] px-2 pt-3 pb-1 text-center font-numero text-6xl leading-none tabular-nums focus:-outline-offset-4 focus:outline-2 focus:outline-destaque sm:text-7xl [&::-webkit-inner-spin-button]:appearance-none ${faixaTime[cor]}`}
            />
          ))}
        </div>
        <div className="mx-auto mt-3 grid max-w-72 grid-cols-2">
          {TIMES.map((cor) => (
            <div key={cor} className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fixarPlacar(cor, placar(cor) - 1)}
                  disabled={placar(cor) === 0}
                  aria-label={`Menos um gol pro ${NOME_TIME[cor].toLowerCase()}`}
                  className={botaoContador}
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => fixarPlacar(cor, placar(cor) + 1)}
                  disabled={placar(cor) === MAXIMO}
                  aria-label={`Mais um gol pro ${NOME_TIME[cor].toLowerCase()}`}
                  className={botaoContador}
                >
                  +
                </button>
              </div>
              {placarFixo[cor] !== null && placarFixo[cor] !== soma[cor] && (
                <button
                  type="button"
                  onClick={() => fixarPlacar(cor, null)}
                  className={`${link} text-xs`}
                >
                  Voltar a somar ({soma[cor]})
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-md text-center text-xs text-apagado">
          O placar vai somando os gols lançados nos jogadores. Se mudar na mão (gol contra, gol
          de quem não é do elenco), ele fica como você deixou.
        </p>
      </section>

      <section>
        <h2 className="mb-4 font-slab text-xl uppercase">Escalação</h2>
        <div className="grid items-start gap-4 sm:grid-cols-2">
          {TIMES.map((cor) => (
            <TabelaTime
              key={cor}
              cor={cor}
              linhas={linhas.filter((l) => l.corTime === cor)}
              porId={porId}
              disponiveis={disponiveis}
              opcoesDe={opcoesDe}
              onOpcoes={setOpcoesDe}
              onMudar={mudar}
              onAdicionar={(id) => adicionar(id, cor)}
              onTirar={tirar}
            />
          ))}
        </div>
      </section>

      {state.erro && (
        <p role="alert" className="text-sm text-perigo">
          {state.erro}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {children && <div className="mr-auto">{children}</div>}
        <Link href={fut ? `/futs/${fut.id}` : "/futs"} className={botaoSecundario}>
          Cancelar
        </Link>
        <button type="submit" disabled={pending} className={botaoPrimario}>
          {pending ? "Salvando..." : fut ? "Salvar alterações" : "Salvar fut"}
        </button>
      </div>
    </form>
  );
}

function TabelaTime({
  cor,
  linhas,
  porId,
  disponiveis,
  opcoesDe,
  onOpcoes,
  onMudar,
  onAdicionar,
  onTirar,
}: {
  cor: Time;
  linhas: Linha[];
  porId: Map<string, JogadorEscalavel>;
  disponiveis: JogadorEscalavel[];
  opcoesDe: string | null;
  onOpcoes: (id: string | null) => void;
  onMudar: (id: string, mudanca: Partial<Linha>) => void;
  onAdicionar: (id: string) => void;
  onTirar: (id: string) => void;
}) {
  return (
    <div className={`${painel} overflow-hidden`}>
      <h3
        className={`px-4 pt-2 pb-1.5 font-numero text-xl tracking-wider uppercase ${faixaTime[cor]}`}
      >
        {NOME_TIME[cor]}
        <span className="ml-2 opacity-60">({linhas.length})</span>
      </h3>

      {linhas.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-apagado">Ninguém escalado ainda.</p>
      ) : (
        <>
          {/* Os contadores ficam sempre alinhados à direita, mesmo quando descem pra
              linha de baixo (tabela estreita), então o cabeçalho continua em cima deles */}
          <div
            aria-hidden
            className="flex justify-end gap-3 px-3 pt-2 font-numero text-sm tracking-wider text-apagado uppercase"
          >
            <span className="w-27 text-center">Gols</span>
            <span className="w-27 text-center">Assist.</span>
          </div>
          <ul className="divide-y divide-linha">
            {linhas.map((linha) => {
              const jogador = porId.get(linha.jogadorId);
              if (!jogador) return null;
              return (
                <LinhaJogador
                  key={linha.jogadorId}
                  linha={linha}
                  jogador={jogador}
                  aberta={opcoesDe === linha.jogadorId}
                  onAlternar={() => onOpcoes(opcoesDe === linha.jogadorId ? null : linha.jogadorId)}
                  onMudar={(mudanca) => onMudar(linha.jogadorId, mudanca)}
                  onTrocarTime={() => {
                    onMudar(linha.jogadorId, { corTime: OUTRO[cor] });
                    onOpcoes(null);
                  }}
                  onTirar={() => onTirar(linha.jogadorId)}
                />
              );
            })}
          </ul>
        </>
      )}

      <Adicionar cor={cor} disponiveis={disponiveis} onAdicionar={onAdicionar} />
    </div>
  );
}

function LinhaJogador({
  linha,
  jogador,
  aberta,
  onAlternar,
  onMudar,
  onTrocarTime,
  onTirar,
}: {
  linha: Linha;
  jogador: JogadorEscalavel;
  aberta: boolean;
  onAlternar: () => void;
  onMudar: (mudanca: Partial<Linha>) => void;
  onTrocarTime: () => void;
  onTirar: () => void;
}) {
  const id = linha.jogadorId;
  const outro = NOME_TIME[OUTRO[linha.corTime]].toLowerCase();

  return (
    <li className={`px-3 py-2 ${aberta ? "bg-superficie-2/60" : ""}`}>
      <input type="hidden" name="escalado" value={id} />
      <input type="hidden" name={`time_${id}`} value={linha.corTime} />
      <input type="hidden" name={`gols_${id}`} value={linha.gols} />
      <input type="hidden" name={`assistencias_${id}`} value={linha.assistencias} />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={aberta}
          aria-label={`${jogador.nome}: trocar de time ou tirar do fut`}
          className="flex min-w-0 flex-1 basis-32 items-center gap-2 rounded-sm py-1 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque"
        >
          <span className="w-6 shrink-0 text-center font-numero text-lg leading-none text-apagado">
            {jogador.numero ?? "–"}
          </span>
          <span className="min-w-0 truncate font-medium" title={jogador.nome}>
            {jogador.nome}
          </span>
          {jogador.posicao && (
            <span className="shrink-0 font-numero text-base leading-none tracking-wide text-apagado">
              {POSICAO_SIGLA[jogador.posicao]}
            </span>
          )}
          <span
            aria-hidden
            className={`shrink-0 text-xs text-apagado transition duration-150 ${aberta ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
        <div className="ml-auto flex gap-3">
          <Contador
            valor={linha.gols}
            rotulo={`gol de ${jogador.nome}`}
            grupo={`Gols de ${jogador.nome}`}
            onMudar={(gols) => onMudar({ gols })}
          />
          <Contador
            valor={linha.assistencias}
            rotulo={`assistência de ${jogador.nome}`}
            grupo={`Assistências de ${jogador.nome}`}
            onMudar={(assistencias) => onMudar({ assistencias })}
          />
        </div>
      </div>

      {aberta && (
        // trocar embaixo do nome, tirar na ponta direita (embaixo das assistências)
        <div className="mt-2 flex flex-wrap gap-2 pb-1 sm:pl-8">
          <button type="button" onClick={onTrocarTime} className={botaoChip}>
            ⇄ Passar pro {outro}
          </button>
          <button type="button" onClick={onTirar} className={`${botaoChip} ml-auto text-perigo`}>
            Tirar do fut
          </button>
        </div>
      )}
    </li>
  );
}

// − valor +, com 108px de largura (w-27) pra casar com o cabeçalho da tabela
function Contador({
  valor,
  rotulo,
  grupo,
  onMudar,
}: {
  valor: number;
  rotulo: string;
  grupo: string;
  onMudar: (valor: number) => void;
}) {
  return (
    <div role="group" aria-label={grupo} className="flex w-27 items-center justify-between">
      <button
        type="button"
        onClick={() => onMudar(limitar(valor - 1))}
        disabled={valor === 0}
        aria-label={`Menos um ${rotulo}`}
        className={botaoContador}
      >
        −
      </button>
      <output
        aria-live="polite"
        className={`w-8 pt-1 text-center font-numero text-2xl leading-none tabular-nums ${
          valor === 0 ? "text-apagado/60" : ""
        }`}
      >
        {valor}
      </output>
      <button
        type="button"
        onClick={() => onMudar(limitar(valor + 1))}
        disabled={valor === MAXIMO}
        aria-label={`Mais um ${rotulo}`}
        className={botaoContador}
      >
        +
      </button>
    </div>
  );
}

function Adicionar({
  cor,
  disponiveis,
  onAdicionar,
}: {
  cor: Time;
  disponiveis: JogadorEscalavel[];
  onAdicionar: (id: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const nomeTime = NOME_TIME[cor].toLowerCase();

  if (!aberto) {
    return (
      <div className="border-t-2 border-linha p-3">
        <button
          type="button"
          onClick={() => setAberto(true)}
          disabled={disponiveis.length === 0}
          className={`${botaoChip} w-full`}
        >
          {disponiveis.length === 0 ? "Todo o elenco já está escalado" : `+ Adicionar ao ${nomeTime}`}
        </button>
      </div>
    );
  }

  const termo = normalizar(busca.trim());
  const filtrados = termo
    ? disponiveis.filter((j) =>
        [j.nome, j.numero].some((v) => v !== null && normalizar(String(v)).includes(termo)),
      )
    : disponiveis;

  function escolher(id: string) {
    onAdicionar(id);
    setBusca("");
  }

  return (
    <div className="space-y-3 border-t-2 border-linha bg-superficie-2/50 p-3">
      <div className="flex gap-2">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          // Enter aqui não pode mandar o fut: escala o primeiro da lista
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (filtrados[0]) escolher(filtrados[0].id);
          }}
          placeholder="Buscar por nome ou número"
          aria-label={`Buscar jogador pra adicionar ao ${nomeTime}`}
          className={`${campoPequeno} min-w-0 flex-1`}
        />
        <button
          type="button"
          onClick={() => {
            setAberto(false);
            setBusca("");
          }}
          className={`${botaoChip} h-10`}
        >
          Pronto
        </button>
      </div>
      {filtrados.length === 0 ? (
        <p className="text-sm text-apagado">
          {disponiveis.length === 0 ? "Todo o elenco já está escalado." : "Ninguém com esse nome."}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2" aria-label={`Quem pode entrar no ${nomeTime}`}>
          {filtrados.map((j) => (
            <li key={j.id}>
              <button
                type="button"
                onClick={() => escolher(j.id)}
                aria-label={`Adicionar ${j.nome} ao ${nomeTime}`}
                className={botaoChip}
              >
                {j.numero !== null && <span className="opacity-60">{j.numero}</span>}
                {j.nome}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
