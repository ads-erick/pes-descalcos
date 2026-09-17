import "server-only";
import { connection } from "next/server";
import { sql } from "./db";
import { requireAdmin } from "./auth";

export type FutResumo = {
  id: string;
  data: string;
  placarBranco: number;
  placarPreto: number;
  jogadores: number;
  destaque: { nome: string; gols: number; assistencias: number } | null;
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

  const [futs, destaques] = await Promise.all([
    sql<
      {
        id: string;
        data: string;
        placar_branco: number;
        placar_preto: number;
        jogadores: number;
      }[]
    >`
      select
        f.id,
        to_char(f.data, 'DD/MM/YYYY') as data,
        f.placar_branco, f.placar_preto,
        count(p.id)::int as jogadores
      from fut f
      left join participacao p on p.fut_id = f.id
      group by f.id
      order by f.data desc, f.criado_em desc
    `,
    sql<
      { fut_id: string; nome: string; gols: number; assistencias: number }[]
    >`
      select distinct on (p.fut_id)
        p.fut_id,
        coalesce(j.apelido, j.nome) as nome,
        p.gols, p.assistencias
      from participacao p
      join jogador j on j.id = p.jogador_id
      where p.gols + p.assistencias > 0
      order by p.fut_id, p.gols + p.assistencias desc, j.nome
    `,
  ]);

  const porFut = new Map(destaques.map((d) => [d.fut_id, d]));

  return futs.map((fut) => {
    const destaque = porFut.get(fut.id);
    return {
      id: fut.id,
      data: fut.data,
      placarBranco: fut.placar_branco,
      placarPreto: fut.placar_preto,
      jogadores: fut.jogadores,
      destaque: destaque
        ? { nome: destaque.nome, gols: destaque.gols, assistencias: destaque.assistencias }
        : null,
    };
  });
}

export async function criarFut(fut: NovoFut) {
  await requireAdmin();

  await sql.begin(async (tx) => {
    const [criado] = await tx<{ id: string }[]>`
      insert into fut (data, placar_branco, placar_preto)
      values (${fut.data}, ${fut.placarBranco}, ${fut.placarPreto})
      returning id
    `;

    const linhas = fut.participacoes.map((p) => ({
      fut_id: criado.id,
      jogador_id: p.jogadorId,
      cor_time: p.corTime,
      gols: p.gols,
      assistencias: p.assistencias,
    }));

    await tx`
      insert into participacao ${tx(linhas, "fut_id", "jogador_id", "cor_time", "gols", "assistencias")}
    `;
  });
}
