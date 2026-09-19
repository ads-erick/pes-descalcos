import "server-only";
import { randomUUID } from "node:crypto";
import { cache } from "react";
import { connection } from "next/server";
import { sql } from "./db";
import { requireAdmin } from "./auth";
import { apagarFoto, enviarFoto } from "./fotos";
import type { Posicao } from "@/lib/jogador";
import { mediasPorGrupo, nivel } from "@/lib/nivel";

export type JogadorResumo = {
  id: string;
  nome: string;
  apelido: string | null;
  numero: number | null;
  posicao: Posicao | null;
  fotoUrl: string | null;
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

export type JogadorEditavel = NovoJogador & { id: string; fotoUrl: string | null };

// "remover" apaga a foto atual; null mantém como está
export type MudancaFoto = File | "remover" | null;

const colunas = (j: NovoJogador) => ({
  nome: j.nome,
  apelido: j.apelido,
  numero: j.numero,
  posicao: j.posicao,
  nivel_base: j.nivelBase,
});

// Cartinhas de todo mundo, arquivados inclusive (a seleção de um fut antigo pode ter
// quem já saiu). A média do grupo usada no nível continua sendo só a do elenco atual.
const listarCartas = cache(async (): Promise<(JogadorResumo & { ativo: boolean })[]> => {
  await connection();
  const jogadores = await sql<(Omit<JogadorResumo, "nivel"> & { saldo: number; ativo: boolean })[]>`
    select
      j.id, j.nome, j.apelido, j.numero, j.posicao, j.ativo,
      j.foto_url as "fotoUrl",
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
    group by j.id
  `;

  const medias = mediasPorGrupo(jogadores.filter((j) => j.ativo));
  return jogadores
    .map(({ saldo, ...j }) => ({ ...j, nivel: nivel({ ...j, saldo }, j.nivelBase, medias) }))
    .sort(
      (a, b) =>
        b.nivel - a.nivel ||
        b.gols - a.gols ||
        b.assistencias - a.assistencias ||
        a.nome.localeCompare(b.nome, "pt-BR"),
    );
});

export async function listarJogadores(): Promise<JogadorResumo[]> {
  return (await listarCartas()).filter((j) => j.ativo);
}

export async function buscarCartas(ids: string[]): Promise<Map<string, JogadorResumo>> {
  const cartas = await listarCartas();
  return new Map(cartas.filter((j) => ids.includes(j.id)).map((j) => [j.id, j]));
}

// O id sai daqui pra foto já subir na pasta do jogador antes do insert
export async function criarJogador(jogador: NovoJogador, foto: File | null) {
  await requireAdmin();
  const id = randomUUID();
  const fotoUrl = foto ? await enviarFoto(id, foto) : null;
  try {
    await sql`
      insert into jogador ${sql({ id, ...colunas(jogador), foto_url: fotoUrl })}
    `;
  } catch (erro) {
    await apagarFoto(fotoUrl);
    throw erro;
  }
}

export async function buscarJogador(id: string): Promise<JogadorEditavel | null> {
  await connection();
  const [jogador] = await sql<JogadorEditavel[]>`
    select id, nome, apelido, numero, posicao, foto_url as "fotoUrl", nivel_base as "nivelBase"
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

export async function atualizarJogador(id: string, jogador: NovoJogador, foto: MudancaFoto) {
  await requireAdmin();
  if (!foto) {
    await sql`update jogador set ${sql(colunas(jogador))} where id = ${id}`;
    return;
  }

  const [anterior] = await sql<{ fotoUrl: string | null }[]>`
    select foto_url as "fotoUrl" from jogador where id = ${id}
  `;
  const fotoUrl = foto === "remover" ? null : await enviarFoto(id, foto);
  await sql`update jogador set ${sql({ ...colunas(jogador), foto_url: fotoUrl })} where id = ${id}`;
  await apagarFoto(anterior?.fotoUrl ?? null);
}

// Quem já jogou algum fut é só arquivado, pra não apagar o histórico das partidas
export async function excluirJogador(id: string): Promise<"excluido" | "arquivado"> {
  await requireAdmin();
  return sql.begin(async (tx) => {
    const excluidos = await tx<{ fotoUrl: string | null }[]>`
      delete from jogador
      where id = ${id}
        and not exists (select 1 from participacao where jogador_id = ${id})
      returning foto_url as "fotoUrl"
    `;
    if (excluidos.count > 0) {
      await apagarFoto(excluidos[0].fotoUrl);
      return "excluido";
    }

    await tx`update jogador set ativo = false where id = ${id}`;
    return "arquivado";
  });
}
