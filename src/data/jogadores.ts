import "server-only";
import { connection } from "next/server";
import { sql } from "./db";
import { requireAdmin } from "./auth";
import type { Posicao } from "@/lib/jogador";
import { mediasPorGrupo, nivel } from "@/lib/nivel";

export type JogadorResumo = {
  id: string;
  nome: string;
  apelido: string | null;
  numero: number | null;
  posicao: Posicao | null;
  jogos: number;
  gols: number;
  assistencias: number;
  nivelBase: number;
  nivel: number;
};

export type JogadorEscalavel = { id: string; nome: string; numero: number | null };

export type NovoJogador = {
  nome: string;
  apelido: string | null;
  numero: number | null;
  posicao: Posicao | null;
  nivelBase: number;
};

const colunas = (j: NovoJogador) => ({
  nome: j.nome,
  apelido: j.apelido,
  numero: j.numero,
  posicao: j.posicao,
  nivel_base: j.nivelBase,
});

export async function listarJogadores(): Promise<JogadorResumo[]> {
  await connection();
  const jogadores = await sql<(Omit<JogadorResumo, "nivel"> & { saldo: number })[]>`
    select
      j.id, j.nome, j.apelido, j.numero, j.posicao,
      j.nivel_base as "nivelBase",
      count(p.id) filter (where p.presente)::int as jogos,
      coalesce(sum(p.gols), 0)::int as gols,
      coalesce(sum(p.assistencias), 0)::int as assistencias,
      coalesce(sum(
        case p.cor_time
          when 'branco' then f.placar_branco - f.placar_preto
          when 'preto' then f.placar_preto - f.placar_branco
        end
      ), 0)::int as saldo
    from jogador j
    left join participacao p on p.jogador_id = j.id
    left join fut f on f.id = p.fut_id
    where j.ativo
    group by j.id
  `;

  const medias = mediasPorGrupo(jogadores);
  return jogadores
    .map(({ saldo, ...j }) => ({ ...j, nivel: nivel({ ...j, saldo }, j.nivelBase, medias) }))
    .sort(
      (a, b) =>
        b.nivel - a.nivel ||
        b.gols - a.gols ||
        b.assistencias - a.assistencias ||
        a.nome.localeCompare(b.nome, "pt-BR"),
    );
}

export async function criarJogador(jogador: NovoJogador) {
  await requireAdmin();
  await sql`
    insert into jogador ${sql(colunas(jogador))}
  `;
}

export async function buscarJogador(id: string): Promise<(NovoJogador & { id: string }) | null> {
  await connection();
  const [jogador] = await sql<(NovoJogador & { id: string })[]>`
    select id, nome, apelido, numero, posicao, nivel_base as "nivelBase"
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
    set ${sql(colunas(jogador))}
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
