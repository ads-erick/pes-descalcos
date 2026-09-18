// Dados de teste pra ver o layout com o elenco cheio: 20 jogadores e 10 futs.
//
//   npm run seed:teste    cria (ou recria) os dados de teste
//   npm run seed:limpar   apaga só os dados de teste
//
// Tudo que o script cria tem id começando com 5eed, então dá pra apagar sem encostar nos dados reais.
// Atenção: um fut real em que algum jogador de teste foi escalado perde essa participação na limpeza.
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

const idJogador = (n) => `5eed0000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const idFut = (n) => `5eed0000-0000-4000-9000-${String(n).padStart(12, "0")}`;

// [nome, apelido, número, posição, talento (0 a 1: quanto mais alto, mais gol e assistência)]
const JOGADORES = [
  ["Rafael Nogueira", "Paredão", 1, "goleiro", 0.3],
  ["Tiago Mendes", null, 12, "goleiro", 0.2],
  ["Bruno Carvalho", "Xerife", 3, "zagueiro", 0.4],
  ["Diego Albuquerque", "Muralha", 4, "zagueiro", 0.3],
  ["Leandro Pereira", null, 2, "zagueiro", 0.2],
  ["Marcos Vinícius Oliveira", "Marquinhos", 6, "zagueiro", 0.5],
  ["Felipe Rocha", "Alemão", 13, "zagueiro", 0.1],
  ["Gustavo Henrique Lima", "Guga", 5, "meio", 0.6],
  ["André Luiz Batista", "Dedé", 8, "meio", 0.8],
  ["Rodrigo Santana", null, 10, "meio", 0.95],
  ["Caio Fernandes", "Maestro", 16, "meio", 0.7],
  ["Pedro Augusto Figueiredo de Souza", "Pedrinho", 17, "meio", 0.4],
  ["Lucas Moreira", "Luquinha", 18, "meio", 0.3],
  ["João Victor Ramos", "JV", 20, "meio", 0.5],
  ["Matheus Costa", "Matheuzinho", 7, "atacante", 0.9],
  ["Vinícius Almeida", "Vini", 11, "atacante", 1],
  ["Renan Barbosa", "Tanque", 9, "atacante", 0.7],
  ["Igor Cardoso", null, 19, "atacante", 0.5],
  ["Wellington Souza", "Tom", 99, "atacante", 0.2],
  ["Eduardo Martins", "Dudu", null, null, 0.4],
];

// Aleatório com semente fixa: rodar de novo gera sempre os mesmos futs
let semente = 42;
function aleatorio() {
  semente = (semente * 1664525 + 1013904223) % 2 ** 32;
  return semente / 2 ** 32;
}
const inteiro = (min, max) => min + Math.floor(aleatorio() * (max - min + 1));
const embaralhar = (lista) =>
  lista
    .map((item) => [aleatorio(), item])
    .sort((a, b) => a[0] - b[0])
    .map(([, item]) => item);

function sortearPorPeso(lista, peso) {
  const total = lista.reduce((soma, item) => soma + peso(item), 0);
  let alvo = aleatorio() * total;
  for (const item of lista) {
    alvo -= peso(item);
    if (alvo <= 0) return item;
  }
  return lista.at(-1);
}

const PESO_GOL = { goleiro: 0.05, zagueiro: 0.5, meio: 1.5, atacante: 3 };
const PESO_ASSISTENCIA = { goleiro: 0.2, zagueiro: 0.7, meio: 3, atacante: 1.5 };
const pesoPosicao = (tabela, posicao) => tabela[posicao ?? "meio"];

async function limpar(tx) {
  await tx`delete from fut where id::text like '5eed%'`;
  await tx`delete from participacao where jogador_id::text like '5eed%'`;
  await tx`delete from jogador where id::text like '5eed%'`;
}

async function criar(tx) {
  const jogadores = JOGADORES.map(([nome, apelido, numero, posicao, talento], i) => ({
    id: idJogador(i + 1),
    nome,
    apelido,
    numero,
    posicao,
    talento,
  }));
  await tx`insert into jogador ${tx(jogadores, "id", "nome", "apelido", "numero", "posicao")}`;

  const goleiros = jogadores.filter((j) => j.posicao === "goleiro");
  const linha = jogadores.filter((j) => j.posicao !== "goleiro");

  for (let n = 1; n <= 10; n++) {
    // Um fut por semana, voltando a partir de 5 de setembro de 2026 (sábado)
    const data = new Date(Date.UTC(2026, 8, 5 - (n - 1) * 7)).toISOString().slice(0, 10);

    const escalados = embaralhar(linha).slice(0, inteiro(10, 14));
    const times = {
      branco: [goleiros[n % 2], ...escalados.filter((_, i) => i % 2 === 0)],
      preto: [goleiros[(n + 1) % 2], ...escalados.filter((_, i) => i % 2 === 1)],
    };

    const stats = new Map(jogadores.map((j) => [j.id, { gols: 0, assistencias: 0 }]));
    const placar = {};
    for (const [cor, time] of Object.entries(times)) {
      const forca = time.reduce((soma, j) => soma + j.talento, 0) / time.length;
      placar[cor] = Math.max(0, Math.round(1 + forca * 6 + (aleatorio() - 0.5) * 5));

      for (let g = 0; g < placar[cor]; g++) {
        const autor = sortearPorPeso(time, (j) => pesoPosicao(PESO_GOL, j.posicao) * (0.2 + j.talento));
        stats.get(autor.id).gols++;
        if (aleatorio() < 0.7) {
          const outros = time.filter((j) => j !== autor);
          const garcom = sortearPorPeso(outros, (j) => pesoPosicao(PESO_ASSISTENCIA, j.posicao) * (0.2 + j.talento));
          stats.get(garcom.id).assistencias++;
        }
      }
    }

    await tx`
      insert into fut (id, data, placar_branco, placar_preto)
      values (${idFut(n)}, ${data}, ${placar.branco}, ${placar.preto})
    `;
    const participacoes = Object.entries(times).flatMap(([cor, time]) =>
      time.map((j) => ({ fut_id: idFut(n), jogador_id: j.id, cor_time: cor, ...stats.get(j.id) })),
    );
    await tx`
      insert into participacao ${tx(participacoes, "fut_id", "jogador_id", "cor_time", "gols", "assistencias")}
    `;
  }
}

try {
  await sql.begin(async (tx) => {
    await limpar(tx);
    if (!process.argv.includes("--limpar")) await criar(tx);
  });
  console.log(process.argv.includes("--limpar") ? "Dados de teste apagados." : "Dados de teste criados: 20 jogadores e 10 futs.");
} finally {
  await sql.end();
}
