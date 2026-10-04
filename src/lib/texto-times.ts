import { POSICAO_SIGLA, POSICOES } from "./jogador";
import { NOME_TIME, formatarHorario, type Atuacao, type CorTime } from "./selecao";

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const EMOJI_TIME: Record<CorTime, string> = { branco: "⚪", preto: "⚫" };

type Escalado = Pick<Atuacao, "nome" | "posicao" | "corTime">;

// Os times do fut em texto, pra colar no grupo do WhatsApp e fixar lá.
// *assim* é negrito no WhatsApp. Um nome por linha com a sigla da posição na
// frente, na ordem do campo (GOL, ZAG, MEI, ATA); quem tá sem posição fecha a lista.
// A data chega como DD/MM/AAAA e o horário (opcional) como HH:MM, igual o banco devolve pras telas.
export function textoDosTimes(
  data: string,
  horario: string | null,
  atuacoes: Escalado[],
  link: string,
) {
  const [dia, mes, ano] = data.split("/").map(Number);
  const semana = DIAS[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()];

  const time = (cor: CorTime) => {
    const ordem = (a: Escalado) => (a.posicao ? POSICOES.indexOf(a.posicao) : POSICOES.length);
    const escalados = atuacoes
      .filter((a) => a.corTime === cor)
      .sort((a, b) => ordem(a) - ordem(b) || a.nome.localeCompare(b.nome, "pt-BR"));
    const linhas = escalados.map(
      (a) => `${a.posicao ? POSICAO_SIGLA[a.posicao] : "???"} - ${a.nome}`,
    );
    return [
      `${EMOJI_TIME[cor]} *${NOME_TIME[cor]}*${escalados.length > 0 ? ` (${escalados.length})` : ""}`,
      ...(linhas.length > 0 ? linhas : ["Ninguém escalado ainda"]),
    ].join("\n");
  };

  const quando = `${semana}, ${data}${horario ? `, às ${formatarHorario(horario)}` : ""}`;
  return [`⚽ *Fut de ${quando}*`, time("branco"), time("preto"), `Tudo no site: ${link}`].join(
    "\n\n",
  );
}
