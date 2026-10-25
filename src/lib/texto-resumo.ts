import { NOME_TIME, placarOrdenado, vencedor, type CorTime } from "./selecao";
import { diaDaSemana } from "./texto-times";

const EMOJI_TIME: Record<CorTime, string> = { branco: "⚪", preto: "⚫" };

type Craque = { nome: string; gols: number; assistencias: number };

// O resumo do fut que já rolou em texto, pra colar no grupo do WhatsApp (a imagem da seleção
// vai junto na cópia quando o navegador deixa). *assim* é negrito lá.
// A data chega como DD/MM/AAAA, igual o banco devolve pras telas.
export function textoDoResumo(
  data: string,
  placarBranco: number,
  placarPreto: number,
  craque: Craque | null,
  link: string,
) {
  const venceu = vencedor(placarBranco, placarPreto);
  const { a, b } = placarOrdenado(placarBranco, placarPreto);
  const placar = `${a} x ${b}`;
  const resultado = venceu
    ? `${EMOJI_TIME[venceu]} *Vitória do ${NOME_TIME[venceu].toLowerCase()}*: ${placar}`
    : `🤝 *Empate*: ${placar}`;
  const mvp = craque
    ? `⭐ *MVP:* ${craque.nome}${craque.gols + craque.assistencias > 0 ? ` (${craque.gols}G/${craque.assistencias}A)` : ""}`
    : null;

  return [
    `⚽ *Resumo do fut de ${diaDaSemana(data)}, ${data}*`,
    resultado,
    ...(mvp ? [mvp] : []),
    `Seleção da semana e os números: ${link}`,
  ].join("\n\n");
}
