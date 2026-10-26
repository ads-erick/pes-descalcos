import { POSICAO_SIGLA, type Posicao } from "./jogador";
import { NOME_TIME, placarOrdenado, vencedor, type CorTime } from "./selecao";
import { diaDaSemana } from "./texto-times";

const EMOJI_TIME: Record<CorTime, string> = { branco: "⚪", preto: "⚫" };

type Numeros = { gols: number; assistencias: number };

// Um ranking das estatísticas, já cortado no top 3
export type TopDoRanking = {
  emoji: string;
  titulo: string;
  top: { colocacao: number; nome: string; valor: number }[];
};

export type Resumo = {
  data: string;
  placarBranco: number;
  placarPreto: number;
  craque: ({ nome: string } & Numeros) | null;
  // A seleção na ordem do campo (GOL, ZAG, MEI, ATA)
  selecao: ({ nome: string; posicao: Posicao; craque: boolean } & Numeros)[];
  // Ex.: "Temporada 2026 · 3 futs"
  periodo: string;
  rankings: TopDoRanking[];
  link: string;
};

// (2G/1A), ou nada quando o jogador não fez nem deu gol
const numeros = ({ gols, assistencias }: Numeros) =>
  gols + assistencias > 0 ? ` (${gols}G/${assistencias}A)` : "";

// O resumo do fut que já rolou em texto, pra colar no grupo do WhatsApp: resultado, MVP,
// a seleção por escrito, o top 3 de cada estatística e o link pro site, onde tá o resto.
// *assim* é negrito lá. A data chega como DD/MM/AAAA, igual o banco devolve pras telas.
export function textoDoResumo({
  data,
  placarBranco,
  placarPreto,
  craque,
  selecao,
  periodo,
  rankings,
  link,
}: Resumo) {
  const venceu = vencedor(placarBranco, placarPreto);
  const { a, b } = placarOrdenado(placarBranco, placarPreto);
  const placar = `${a} x ${b}`;
  const resultado = venceu
    ? `${EMOJI_TIME[venceu]} *Vitória do ${NOME_TIME[venceu].toLowerCase()}*: ${placar}`
    : `🤝 *Empate*: ${placar}`;
  const mvp = craque ? `⭐ *MVP:* ${craque.nome}${numeros(craque)}` : null;

  const timeDaSemana =
    selecao.length > 0
      ? [
          "🏟️ *Seleção da semana*",
          ...selecao.map(
            (j) => `${POSICAO_SIGLA[j.posicao]} - ${j.nome}${numeros(j)}${j.craque ? " ⭐" : ""}`,
          ),
        ].join("\n")
      : null;

  const comAlguem = rankings.filter((r) => r.top.length > 0);
  const estatisticas =
    comAlguem.length > 0
      ? [
          `📊 *Estatísticas* (${periodo})`,
          ...comAlguem.map(
            (r) =>
              `${r.emoji} *${r.titulo}:* ${r.top.map((j) => `${j.colocacao}º ${j.nome} (${j.valor})`).join(" · ")}`,
          ),
        ].join("\n")
      : null;

  return [
    `⚽ *Resumo do fut de ${diaDaSemana(data)}, ${data}*`,
    resultado,
    ...(mvp ? [mvp] : []),
    ...(timeDaSemana ? [timeDaSemana] : []),
    ...(estatisticas ? [estatisticas] : []),
    `🔄 *O site já tá atualizado!* Quer ver a sua cartinha, a seleção no campo e as estatísticas completas? Tá tudo lá: ${link}`,
  ].join("\n\n");
}
