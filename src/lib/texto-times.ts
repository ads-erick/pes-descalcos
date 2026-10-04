import { POSICOES, type Posicao } from "./jogador";
import { NOME_TIME, formatarHorario, type Atuacao, type CorTime } from "./selecao";

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const EMOJI_TIME: Record<CorTime, string> = { branco: "⚪", preto: "⚫" };

// Do jeito que se fala no grupo, não o rótulo formal das cartas
const SETOR: Record<Posicao, string> = {
  goleiro: "🧤 Goleiro",
  zagueiro: "🛡️ Zaga",
  meio: "🎯 Meio",
  atacante: "⚡ Ataque",
};

type Escalado = Pick<Atuacao, "nome" | "posicao" | "corTime">;

// Os times do fut em texto, pra colar no grupo do WhatsApp e fixar lá.
// *assim* é negrito no WhatsApp. Cada time sai dividido por setor, na ordem do
// campo (goleiro, zaga, meio, ataque); setor vazio não aparece e quem tá sem
// posição fecha a lista.
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
    const escalados = atuacoes.filter((a) => a.corTime === cor);
    const nomes = (posicao: Posicao | null) =>
      escalados
        .filter((a) => a.posicao === posicao)
        .map((a) => a.nome)
        .sort((a, b) => a.localeCompare(b, "pt-BR"))
        .join(", ");
    const setores = [...POSICOES, null]
      .map((posicao) => [posicao ? SETOR[posicao] : "❔ Sem posição", nomes(posicao)])
      .filter(([, lista]) => lista)
      .map(([setor, lista]) => `${setor}: ${lista}`);
    return [
      `${EMOJI_TIME[cor]} *${NOME_TIME[cor]}*${escalados.length > 0 ? ` (${escalados.length})` : ""}`,
      ...(setores.length > 0 ? setores : ["Ninguém escalado ainda"]),
    ].join("\n");
  };

  const quando = `${semana}, ${data}${horario ? `, às ${formatarHorario(horario)}` : ""}`;
  return [`⚽ *Fut de ${quando}*`, time("branco"), time("preto"), `Tudo no site: ${link}`].join(
    "\n\n",
  );
}
