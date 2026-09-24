import "server-only";
import { headers } from "next/headers";
import { sign } from "@/data/auth";
import { sql } from "@/data/db";
import { chaveDoIp } from "@/lib/ip";

// Quem erra a senha LIMITE vezes em JANELA_MINUTOS fica bloqueado até a mais antiga
// dessas tentativas sair da janela. Quem continua chutando consegue no máximo LIMITE
// palpites a cada JANELA_MINUTOS.
const LIMITE = 5;
const JANELA_MINUTOS = 15;

// O banco guarda o HMAC do IP, não o IP: dá pra comparar sem saber de quem é
async function ipHash() {
  const cabecalhos = await headers();
  return sign(chaveDoIp(cabecalhos.get("x-forwarded-for") ?? cabecalhos.get("x-real-ip")));
}

/**
 * Conta mais uma tentativa de login do IP atual, antes de conferir a senha. Se o IP já
 * estourou o limite, não conta e devolve até quando ele fica bloqueado.
 */
export async function registrarTentativa(): Promise<Date | null> {
  const ip = await ipHash();
  return sql.begin(async (tx) => {
    // Enfileira as tentativas do mesmo IP: em paralelo, várias passariam juntas pela contagem
    await tx`select pg_advisory_xact_lock(hashtext(${ip}))`;
    const [ultimaQueConta] = await tx<{ em: Date }[]>`
      select em from login_tentativa
      where ip_hash = ${ip} and em > now() - make_interval(mins => ${JANELA_MINUTOS})
      order by em desc
      offset ${LIMITE - 1} limit 1
    `;
    if (ultimaQueConta) {
      return new Date(ultimaQueConta.em.getTime() + JANELA_MINUTOS * 60_000);
    }

    await tx`insert into login_tentativa (ip_hash) values (${ip})`;
    await tx`delete from login_tentativa where em < now() - interval '1 day'`;
    return null;
  });
}

/** Senha certa: zera as tentativas do IP. */
export async function limparTentativas() {
  await sql`delete from login_tentativa where ip_hash = ${await ipHash()}`;
}
