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

export type JogadorEscalavel = { id: string; nome: string; numero: number | null };

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

export async function buscarJogador(id: string): Promise<(NovoJogador & { id: string }) | null> {
  await connection();
  const [jogador] = await sql<(NovoJogador & { id: string })[]>`
    select id, nome, apelido, numero, posicao
    from jogador
    where id = ${id} and ativo
  `;
  return jogador ?? null;
}

// Ativos + quem já está no fut sendo editado (mesmo que tenha sido arquivado depois)
export async function listarEscalaveis(futId?: string): Promise<JogadorEscalavel[]> {
  await connection();
  return sql<JogadorEscalavel[]>`
    select j.id, coalesce(j.apelido, j.nome) as nome, j.numero
    from jogador j
    where j.ativo
      or exists (
        select 1 from participacao p
        where p.jogador_id = j.id and p.fut_id = ${futId ?? null}
      )
    order by nome
  `;
}

export async function atualizarJogador(id: string, jogador: NovoJogador) {
  await requireAdmin();
  await sql`
    update jogador
    set ${sql(jogador, "nome", "apelido", "numero", "posicao")}
    where id = ${id}
  `;
}

// Quem já jogou algum fut é só arquivado, pra não apagar o histórico das partidas
export async function excluirJogador(id: string): Promise<"excluido" | "arquivado"> {
  await requireAdmin();
  return sql.begin(async (tx) => {
    const excluidos = await tx`
      delete from jogador
      where id = ${id}
        and not exists (select 1 from participacao where jogador_id = ${id})
    `;
    if (excluidos.count > 0) return "excluido";

    await tx`update jogador set ativo = false where id = ${id}`;
    return "arquivado";
  });
}
