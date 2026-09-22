import type { NextRequest } from "next/server";
import { sql } from "@/data/db";

// Chamada uma vez por dia pelo cron da Vercel (vercel.json). O Supabase grátis pausa o
// projeto depois de 7 dias sem uso, e aí o site fica fora do ar até alguém restaurar no painel.
// A Vercel manda a CRON_SECRET no Authorization; sem ela, ninguém de fora dispara a consulta.
export async function GET(request: NextRequest) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  await sql`select 1`;
  return Response.json({ ok: true });
}
