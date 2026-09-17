import "server-only";
import { connection } from "next/server";
import { sql } from "./db";
import { requireAdmin } from "./auth";
import type { Posicao } from "@/lib/jogador";

export type JogadorResumo = {
  id: string;
  nome: string;
  apelido: string | null;
  numero: number | null;
  posicao: Posicao | null;
  jogos: number;
  gols: number;
  assistencias: number;
};

export type NovoJogador = {
  nome: string;
  apelido: string | null;
  numero: number | null;
  posicao: Posicao | null;
};

export async function listarJogadores(): Promise<JogadorResumo[]> {
  await connection();
  return sql<JogadorResumo[]>`
    select
      j.id, j.nome, j.apelido, j.numero, j.posicao,
      count(p.id) filter (where p.presente)::int as jogos,
      coalesce(sum(p.gols), 0)::int as gols,
      coalesce(sum(p.assistencias), 0)::int as assistencias
    from jogador j
    left join participacao p on p.jogador_id = j.id
    where j.ativo
    group by j.id
    order by gols desc, assistencias desc, j.nome
  `;
}

export async function criarJogador(jogador: NovoJogador) {
  await requireAdmin();
  await sql`
    insert into jogador ${sql(jogador, "nome", "apelido", "numero", "posicao")}
  `;
}
