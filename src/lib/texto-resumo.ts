import { NOME_TIME, vencedor, type CorTime } from "./selecao";
import { diaDaSemana } from "./texto-times";

const EMOJI_TIME: Record<CorTime, string> = { branco: "⚪", preto: "⚫" };

type Craque = { nome: string; gols: number; assistencias: number };

// O resumo do fut que já rolou em texto, pra colar no grupo do WhatsApp (a imagem da seleção
// vai à parte, o WhatsApp não cola texto e imagem juntos). *assim* é negrito lá.
// A data chega como DD/MM/AAAA, igual o banco devolve pras telas.
export function textoDoResumo(
  data: string,
  placarBranco: number,
  placarPreto: number,
  craque: Craque | null,
  link: string,
) {
  const venceu = vencedor(placarBranco, placarPreto);
  const placar = `${placarBranco} x ${placarPreto}`;
  const resultado = venceu
    ? `${EMOJI_TIME[venceu]} *Vitória do ${NOME_TIME[venceu].toLowerCase()}*: ${placar}`
    : `🤝 *Empate*: ${placar}`;
  const mvp = craque
    ? `⭐ *MVP:* ${craque.nome} (${craque.gols}G/${craque.assistencias}A)`
    : null;

  return [
    `⚽ *Resumo do fut de ${diaDaSemana(data)}, ${data}*`,
    resultado,
    ...(mvp ? [mvp] : []),
    `Seleção da semana e os números: ${link}`,
  ].join("\n\n");
}
