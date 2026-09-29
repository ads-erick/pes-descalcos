import type { Posicao } from "./jogador";

// Critérios do sorteio de times. Ficam em código pra dar pra ajustar à vontade.

// Cada posição é dividida entre os dois times (um goleiro pra cada lado, zagueiros
// divididos...). Quem não tem posição vai por último e completa os times.
const ORDEM: (Posicao | null)[] = ["goleiro", "zagueiro", "meio", "atacante", null];
// Quantas divisões aleatórias são testadas a cada sorteio
const TENTATIVAS = 200;
// Diferença de média aceita acima da melhor encontrada. Com folga o "sortear de novo"
// traz times diferentes, e não sempre a mesma divisão perfeita.
const FOLGA = 0.25;

export type Sorteavel = { id: string; nivel: number; posicao: Posicao | null };

export type Times<T> = { branco: T[]; preto: T[] };

// Compara pela média, não pela soma: com número ímpar um time fica com um a mais, e igualar
// a soma deixaria esse time mais fraco jogador a jogador (só 7 jogam por vez, o resto reveza)
export function media(time: Sorteavel[]) {
  if (time.length === 0) return 0;
  return time.reduce((soma, j) => soma + j.nivel, 0) / time.length;
}

function embaralhar<T>(itens: T[], aleatorio: () => number) {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Distribui intercalando, posição por posição: cada posição fica dividida (no máximo um a mais
// de um lado) e os times ficam com o mesmo tamanho (ou um a mais, se o número for ímpar)
function dividir<T extends Sorteavel>(jogadores: T[], aleatorio: () => number): Times<T> {
  const fila = ORDEM.flatMap((posicao) =>
    embaralhar(
      jogadores.filter((j) => j.posicao === posicao),
      aleatorio,
    ),
  );
  const times: Times<T> = { branco: [], preto: [] };
  const primeiro = aleatorio() < 0.5 ? "branco" : "preto";
  const segundo = primeiro === "branco" ? "preto" : "branco";
  fila.forEach((j, i) => times[i % 2 === 0 ? primeiro : segundo].push(j));
  return times;
}

// Troca jogadores da mesma posição entre os times enquanto isso aproximar a média dos dois.
// A troca não muda o tamanho dos times, então dá pra calcular a nova diferença direto.
function equilibrar<T extends Sorteavel>(times: Times<T>) {
  if (times.branco.length === 0 || times.preto.length === 0) return times;
  const peso = 1 / times.branco.length + 1 / times.preto.length;
  let diferenca = media(times.branco) - media(times.preto);
  let melhorou = true;
  while (melhorou && diferenca !== 0) {
    melhorou = false;
    for (let i = 0; i < times.branco.length; i++) {
      for (let k = 0; k < times.preto.length; k++) {
        const b = times.branco[i];
        const p = times.preto[k];
        if (b.posicao !== p.posicao) continue;
        const nova = diferenca - peso * (b.nivel - p.nivel);
        if (Math.abs(nova) < Math.abs(diferenca) - 1e-9) {
          times.branco[i] = p;
          times.preto[k] = b;
          diferenca = nova;
          melhorou = true;
        }
      }
    }
  }
  return times;
}

const diferencaEntre = (times: Times<Sorteavel>) =>
  Math.abs(media(times.branco) - media(times.preto));

// Monta branco x preto com a média dos níveis mais parecida possível, respeitando as
// posições. Entre as divisões boas, escolhe uma ao acaso.
export function sortearTimes<T extends Sorteavel>(
  jogadores: T[],
  aleatorio: () => number = Math.random,
): Times<T> {
  const candidatos = Array.from({ length: TENTATIVAS }, () =>
    equilibrar(dividir(jogadores, aleatorio)),
  );
  const melhor = Math.min(...candidatos.map(diferencaEntre));
  const bons = candidatos.filter((t) => diferencaEntre(t) <= melhor + FOLGA);
  const escolhido = bons[Math.floor(aleatorio() * bons.length)];

  const ordenar = (time: T[]) =>
    [...time].sort(
      (a, b) => ORDEM.indexOf(a.posicao) - ORDEM.indexOf(b.posicao) || b.nivel - a.nivel,
    );
  return { branco: ordenar(escolhido.branco), preto: ordenar(escolhido.preto) };
}
