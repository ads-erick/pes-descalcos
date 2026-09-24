import "server-only";
import { connection } from "next/server";
import { sql } from "./db";
import { requireAdmin } from "./auth";

// Vagas da seleção do fut escolhidas na mão: número da vaga → jogador
export async function buscarEscolhas(futId: string): Promise<Map<number, string>> {
  await connection();
  const linhas = await sql<{ vaga: number; jogadorId: string }[]>`
    select vaga, jogador_id as "jogadorId"
    from selecao_escolha
    where fut_id = ${futId}
  `;
  return new Map(linhas.map((l) => [l.vaga, l.jogadorId]));
}

// As mesmas escolhas, de todos os futs de uma vez: fut → (número da vaga → jogador)
export async function buscarEscolhasDeTodos(): Promise<Map<string, Map<number, string>>> {
  await connection();
  const linhas = await sql<{ futId: string; vaga: number; jogadorId: string }[]>`
    select fut_id as "futId", vaga, jogador_id as "jogadorId"
    from selecao_escolha
  `;
  const porFut = new Map<string, Map<number, string>>();
  for (const { futId, vaga, jogadorId } of linhas) {
    if (!porFut.has(futId)) porFut.set(futId, new Map());
    porFut.get(futId)!.set(vaga, jogadorId);
  }
  return porFut;
}

// Põe o jogador na vaga. Se ele já estava escolhido em outra vaga do mesmo fut, sai de
// lá (a vaga antiga volta pra conta). Sem jogador, a vaga volta pra conta.
export async function escolherVaga(futId: string, vaga: number, jogadorId: string | null) {
  await requireAdmin();

  await sql.begin(async (tx) => {
    await tx`delete from selecao_escolha where fut_id = ${futId} and vaga = ${vaga}`;
    if (!jogadorId) return;
    await tx`delete from selecao_escolha where fut_id = ${futId} and jogador_id = ${jogadorId}`;
    await tx`
      insert into selecao_escolha (fut_id, vaga, jogador_id)
      values (${futId}, ${vaga}, ${jogadorId})
    `;
  });
}
