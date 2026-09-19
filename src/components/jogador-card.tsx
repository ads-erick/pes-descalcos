import Image from "next/image";
import type { JogadorResumo } from "@/data/jogadores";
import { POSICAO_SIGLA, iniciais } from "@/lib/jogador";
import { raridade, type Raridade } from "@/lib/nivel";

// Recorte da carta FUT: "coroa" em cima e ponta embaixo
const FORMATO =
  "polygon(50% 0%, 60% 2.4%, 79% 2.4%, 90% 0.4%, 100% 6.5%, 100% 87%, 89% 92.5%, 50% 100%, 11% 92.5%, 0% 87%, 0% 6.5%, 10% 0.4%, 21% 2.4%, 40% 2.4%)";

// borda = moldura metálica; fundo = corpo da carta; tinta = texto
const ESTILO: Record<Raridade, { borda: string; fundo: string; tinta: string; linha: string }> = {
  ouro: {
    borda: "linear-gradient(160deg, #fff3c4, #b7862a 30%, #f5dc8e 55%, #8a5f16)",
    fundo:
      "radial-gradient(120% 70% at 50% 20%, #fdf1c2 0%, transparent 60%), linear-gradient(165deg, #f3d77f 0%, #d8ac48 45%, #b98a2c 75%, #e2bd5c 100%)",
    tinta: "#2b1d05",
    linha: "rgb(43 29 5 / 0.3)",
  },
  prata: {
    borda: "linear-gradient(160deg, #ffffff, #8d939b 30%, #e8ebee 55%, #666c75)",
    fundo:
      "radial-gradient(120% 70% at 50% 20%, #ffffff 0%, transparent 60%), linear-gradient(165deg, #e6e9ec 0%, #bcc2c9 45%, #9ba2ab 75%, #cfd4d9 100%)",
    tinta: "#1b2027",
    linha: "rgb(27 32 39 / 0.28)",
  },
  bronze: {
    borda: "linear-gradient(160deg, #ffd9b0, #8a4f22 30%, #e6a877 55%, #6b3812)",
    fundo:
      "radial-gradient(120% 70% at 50% 20%, #fbd9b5 0%, transparent 60%), linear-gradient(165deg, #e5ad7c 0%, #c07f4a 45%, #9c5f30 75%, #d39a68 100%)",
    tinta: "#2e1606",
    linha: "rgb(46 22 6 / 0.3)",
  },
};

export function JogadorCard({ jogador }: { jogador: JogadorResumo }) {
  const tier = raridade(jogador.nivel);
  const estilo = ESTILO[tier];
  const variacao = jogador.nivel - jogador.nivelBase;
  const nomeNaCarta = jogador.apelido ?? jogador.nome;

  return (
    <article
      aria-label={`${nomeNaCarta}, nível ${jogador.nivel}`}
      className="@container relative aspect-[5/7] drop-shadow-[0_6px_10px_rgb(0_0_0/0.35)]"
      style={{ color: estilo.tinta }}
    >
      {/* Moldura e corpo: a moldura aparece como a borda em volta do corpo */}
      <div className="absolute inset-0" style={{ clipPath: FORMATO, background: estilo.borda }} />
      <div
        className="absolute inset-[2.2%] overflow-hidden"
        style={{ clipPath: FORMATO, background: estilo.fundo }}
      >
        {/* Brilho metálico na diagonal */}
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgb(255_255_255/0.35)_45%,transparent_55%)]" />

        {/* Foto (ou iniciais) do lado direito, sumindo embaixo como nas cartas FUT */}
        <div className="absolute top-[9cqw] right-[5cqw] aspect-square w-[64cqw] [mask-image:linear-gradient(to_bottom,black_72%,transparent)]">
          {jogador.fotoUrl ? (
            <Image
              src={jogador.fotoUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 160px, (min-width: 640px) 30vw, 45vw"
              className="object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center font-slab text-[26cqw] opacity-25">
              {iniciais(nomeNaCarta)}
            </span>
          )}
        </div>

        {/* Coluna da esquerda: nível, posição, escudo do clube e número */}
        <div className="absolute top-[12cqw] left-[8cqw] flex w-[22cqw] flex-col items-center text-center">
          <p className="font-numero text-[21cqw] leading-[0.8]">{jogador.nivel}</p>
          <p className="mt-[1cqw] font-numero text-[8cqw] leading-none tracking-wide">
            {jogador.posicao ? POSICAO_SIGLA[jogador.posicao] : "–"}
          </p>
          {variacao !== 0 && (
            <p
              className="mt-[0.5cqw] font-numero text-[5.5cqw] leading-none opacity-75"
              title={`Nível escolhido: ${jogador.nivelBase}`}
            >
              {variacao > 0 ? `▲${variacao}` : `▼${-variacao}`}
            </p>
          )}
          <span className="mt-[2cqw] h-px w-[14cqw]" style={{ background: estilo.linha }} />
          <span className="escudo mt-[2cqw] h-[13cqw]" title="Pés Descalços FC" />
          {jogador.numero !== null && (
            <p className="mt-[1.5cqw] font-numero text-[7cqw] leading-none">#{jogador.numero}</p>
          )}
        </div>

        {/* Nome e estatísticas */}
        <div className="absolute inset-x-[8cqw] top-[76cqw] text-center">
          <h2 className="truncate pt-[1.5cqw] font-numero text-[12.5cqw] leading-[0.95] tracking-wide uppercase">
            {nomeNaCarta}
          </h2>
          {/* Linha sempre presente (vazia sem apelido) pra todas as cartas terem a mesma altura */}
          <p className="truncate text-[4.5cqw] leading-tight font-semibold opacity-70">
            {jogador.apelido ? jogador.nome : "\u00a0"}
          </p>
          <div className="mx-auto mt-[2cqw] h-px w-[80%]" style={{ background: estilo.linha }} />
          <dl className="mt-[2.5cqw] grid grid-cols-3">
            <Stat label="JOG" valor={jogador.jogos} linha={estilo.linha} />
            <Stat label="GOL" valor={jogador.gols} linha={estilo.linha} />
            <Stat label="AST" valor={jogador.assistencias} linha={estilo.linha} ultima />
          </dl>
        </div>
      </div>
    </article>
  );
}

function Stat({
  label,
  valor,
  linha,
  ultima,
}: {
  label: string;
  valor: number;
  linha: string;
  ultima?: boolean;
}) {
  return (
    <div
      className="flex flex-col-reverse"
      style={ultima ? undefined : { borderRight: `1px solid ${linha}` }}
    >
      <dt className="font-numero text-[5cqw] leading-none tracking-wider opacity-70">{label}</dt>
      <dd className="font-numero text-[11cqw] leading-none">{valor}</dd>
    </div>
  );
}
