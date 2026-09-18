import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import type postgres from "postgres";
import { sql } from "./db";
import { requireAdmin } from "./auth";
import { selecaoDoFut, type Atuacao, type AtuacaoPontuada } from "@/lib/selecao";

export type FutResumo = {
  id: string;
  data: string;
  placarBranco: number;
  placarPreto: number;
  jogadores: number;
  craque: AtuacaoPontuada | null;
};

export type AtuacaoNoFut = Atuacao & {
  nomeCompleto: string;
  numero: number | null;
};

export type DetalheFut = {
  id: string;
  data: string;
  placarBranco: number;
  placarPreto: number;
  atuacoes: AtuacaoNoFut[];
};

export type NovaParticipacao = {
  jogadorId: string;
  corTime: "branco" | "preto";
  gols: number;
  assistencias: number;
};

export type NovoFut = {
  data: string;
  placarBranco: number;
  placarPreto: number;
  participacoes: NovaParticipacao[];
};

export async function listarFuts(): Promise<FutResumo[]> {
  await connection();

  const [futs, atuacoes] = await Promise.all([
    sql<{ id: string; data: string; placar_branco: number; placar_preto: number }[]>`
      select id, to_char(data, 'DD/MM/YYYY') as data, placar_branco, placar_preto
      from fut
      order by fut.data desc, criado_em desc
    `,
    sql<(Atuacao & { futId: string })[]>`
      select
        p.fut_id as "futId",
        p.jogador_id as "jogadorId",
        coalesce(j.apelido, j.nome) as nome,
        j.posicao,
        p.cor_time as "corTime",
        p.gols, p.assistencias
      from participacao p
      join jogador j on j.id = p.jogador_id
    `,
  ]);

  const porFut = Map.groupBy(atuacoes, (a) => a.futId);

  return futs.map((fut) => {
    const doFut = porFut.get(fut.id) ?? [];
    const [craque] = selecaoDoFut(doFut, fut.placar_branco, fut.placar_preto);
    return {
      id: fut.id,
      data: fut.data,
      placarBranco: fut.placar_branco,
      placarPreto: fut.placar_preto,
      jogadores: doFut.length,
      craque: craque ?? null,
    };
  });
}

// cache: a página e o generateMetadata pedem o mesmo fut na mesma requisição
export const buscarDetalheFut = cache(async (id: string): Promise<DetalheFut | null> => {
  await connection();

  const [[fut], atuacoes] = await Promise.all([
    sql<{ id: string; data: string; placar_branco: number; placar_preto: number }[]>`
      select id, to_char(data, 'DD/MM/YYYY') as data, placar_branco, placar_preto
      from fut
      where id = ${id}
    `,
    sql<AtuacaoNoFut[]>`
      select
        p.jogador_id as "jogadorId",
        coalesce(j.apelido, j.nome) as nome,
        j.nome as "nomeCompleto",
        j.numero, j.posicao,
        p.cor_time as "corTime",
        p.gols, p.assistencias
      from participacao p
      join jogador j on j.id = p.jogador_id
      where p.fut_id = ${id}
      order by p.gols + p.assistencias desc, nome
    `,
  ]);

  if (!fut) return null;

  return {
    id: fut.id,
    data: fut.data,
    placarBranco: fut.placar_branco,
    placarPreto: fut.placar_preto,
    atuacoes,
  };
});

export async function buscarFut(id: string): Promise<(NovoFut & { id: string }) | null> {
  await connection();

  const [[fut], participacoes] = await Promise.all([
    sql<{ id: string; data: string; placar_branco: number; placar_preto: number }[]>`
      select id, to_char(data, 'YYYY-MM-DD') as data, placar_branco, placar_preto
      from fut
      where id = ${id}
    `,
    sql<NovaParticipacao[]>`
      select
        jogador_id as "jogadorId",
        cor_time as "corTime",
        gols, assistencias
      from participacao
      where fut_id = ${id}
    `,
  ]);

  if (!fut) return null;

  return {
    id: fut.id,
    data: fut.data,
    placarBranco: fut.placar_branco,
    placarPreto: fut.placar_preto,
    participacoes,
  };
}

async function inserirParticipacoes(
  tx: postgres.TransactionSql,
  futId: string,
  participacoes: NovaParticipacao[],
) {
  const linhas = participacoes.map((p) => ({
    fut_id: futId,
    jogador_id: p.jogadorId,
    cor_time: p.corTime,
    gols: p.gols,
    assistencias: p.assistencias,
  }));

  await tx`
    insert into participacao ${tx(linhas, "fut_id", "jogador_id", "cor_time", "gols", "assistencias")}
  `;
}

export async function criarFut(fut: NovoFut) {
  await requireAdmin();

  await sql.begin(async (tx) => {
    const [criado] = await tx<{ id: string }[]>`
      insert into fut (data, placar_branco, placar_preto)
      values (${fut.data}, ${fut.placarBranco}, ${fut.placarPreto})
      returning id
    `;
    await inserirParticipacoes(tx, criado.id, fut.participacoes);
  });
}

// Troca a escalação inteira: mais simples que comparar quem entrou, saiu ou mudou
export async function atualizarFut(id: string, fut: NovoFut) {
  await requireAdmin();

  await sql.begin(async (tx) => {
    await tx`
      update fut
      set data = ${fut.data}, placar_branco = ${fut.placarBranco}, placar_preto = ${fut.placarPreto}
      where id = ${id}
    `;
    await tx`delete from participacao where fut_id = ${id}`;
    await inserirParticipacoes(tx, id, fut.participacoes);
  });
}

// As participações saem junto (on delete cascade)
export async function excluirFut(id: string) {
  await requireAdmin();
  await sql`delete from fut where id = ${id}`;
}
