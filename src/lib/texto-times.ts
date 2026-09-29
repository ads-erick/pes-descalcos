import { POSICOES } from "./jogador";
import { NOME_TIME, formatarHorario, type Atuacao, type CorTime } from "./selecao";

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const EMOJI_TIME: Record<CorTime, string> = { branco: "⚪", preto: "⚫" };

type Escalado = Pick<Atuacao, "nome" | "posicao" | "corTime">;

// Os times do fut em texto, pra colar no grupo do WhatsApp e fixar lá.
// *assim* é negrito no WhatsApp. Goleiro abre a lista (com a luva) e o resto
// segue a ordem do campo, de trás pra frente; sem posição vai pro fim.
// A data chega como DD/MM/AAAA e o horário (opcional) como HH:MM, igual o banco devolve pras telas.
export function textoDosTimes(
  data: string,
  horario: string | null,
  atuacoes: Escalado[],
  link: string,
) {
  const [dia, mes, ano] = data.split("/").map(Number);
  const semana = DIAS[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()];
  const ordem = (a: Escalado) => (a.posicao ? POSICOES.indexOf(a.posicao) : POSICOES.length);

  const time = (cor: CorTime) => {
    const escalados = atuacoes
      .filter((a) => a.corTime === cor)
      .sort((a, b) => ordem(a) - ordem(b) || a.nome.localeCompare(b.nome, "pt-BR"));
    const linhas = escalados.map(
      (a, i) => `${i + 1}. ${a.nome}${a.posicao === "goleiro" ? " 🧤" : ""}`,
    );
    return [
      `${EMOJI_TIME[cor]} *${NOME_TIME[cor]}*`,
      ...(linhas.length > 0 ? linhas : ["Ninguém escalado ainda"]),
    ].join("\n");
  };

  const quando = `${semana}, ${data}${horario ? `, às ${formatarHorario(horario)}` : ""}`;
  return [`⚽ *Fut de ${quando}*`, time("branco"), time("preto"), `Tudo no site: ${link}`].join(
    "\n\n",
  );
}
