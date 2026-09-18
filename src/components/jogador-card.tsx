import type { JogadorResumo } from "@/data/jogadores";
import { POSICAO_SIGLA, iniciais } from "@/lib/jogador";
import { raridade, type Raridade } from "@/lib/nivel";

const ESTILO_RARIDADE: Record<Raridade, string> = {
  ouro: "from-amber-200 via-yellow-400 to-amber-600 text-amber-950",
  prata: "from-slate-100 via-slate-300 to-slate-500 text-slate-900",
  bronze: "from-orange-200 via-orange-400 to-amber-800 text-orange-950",
};

export function JogadorCard({ jogador }: { jogador: JogadorResumo }) {
  const tier = raridade(jogador.nivel);
  const variacao = jogador.nivel - jogador.nivelBase;
  const nomeNaCarta = jogador.apelido ?? jogador.nome;

  return (
    <article
      className={`flex aspect-[3/4] flex-col rounded-2xl bg-linear-to-br p-4 shadow-lg ${ESTILO_RARIDADE[tier]}`}
    >
      <div className="flex items-start justify-between">
        <div className="leading-none">
          <p className="text-4xl font-black tabular-nums" title="Nível">
            {jogador.nivel}
          </p>
          <p className="mt-1 text-sm font-bold tracking-wide">
            {jogador.posicao ? POSICAO_SIGLA[jogador.posicao] : "–"}
            {variacao !== 0 && (
              <span
                className="ml-1.5 text-xs tabular-nums opacity-70"
                title={`Nível escolhido: ${jogador.nivelBase}`}
              >
                {variacao > 0 ? `▲${variacao}` : `▼${-variacao}`}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
            {tier}
          </span>
          {jogador.numero !== null && (
            <span className="text-sm font-bold tabular-nums opacity-75">#{jogador.numero}</span>
          )}
        </div>
      </div>

      <div className="mx-auto my-3 flex size-16 items-center justify-center rounded-full bg-black/10 text-2xl font-black sm:size-20">
        {iniciais(nomeNaCarta)}
      </div>

      <h2 className="truncate text-center text-lg font-extrabold uppercase">
        {nomeNaCarta}
      </h2>
      {/* Linha sempre presente (vazia sem apelido) pra todas as cartas terem a mesma altura */}
      <p className="truncate text-center text-xs opacity-75">
        {jogador.apelido ? jogador.nome : "\u00a0"}
      </p>

      <dl className="mt-auto grid grid-cols-3 border-t border-black/15 pt-2 text-center">
        <Stat label="JOG" valor={jogador.jogos} />
        <Stat label="GOL" valor={jogador.gols} />
        <Stat label="AST" valor={jogador.assistencias} />
      </dl>
    </article>
  );
}

function Stat({ label, valor }: { label: string; valor: number }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold opacity-70">{label}</dt>
      <dd className="text-xl font-black">{valor}</dd>
    </div>
  );
}
