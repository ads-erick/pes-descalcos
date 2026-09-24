import "server-only";
import { headers } from "next/headers";

// Cloudflare Turnstile no login. Só liga com as duas chaves configuradas: sem elas
// (no dev, por exemplo) o formulário não mostra o widget e o servidor não confere.

/** A chave pública do widget, ou undefined se o captcha estiver desligado. */
export function captchaSiteKey() {
  const siteKey = process.env.TURNSTILE_SITE_KEY;
  return siteKey && process.env.TURNSTILE_SECRET_KEY ? siteKey : undefined;
}

/**
 * Confere o token do widget na Cloudflare (cada token só vale uma vez). Na dúvida
 * (token faltando, Cloudflare fora do ar) recusa: senão o captcha vira enfeite.
 */
export async function captchaValido(token: FormDataEntryValue | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!captchaSiteKey() || !secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim();
  try {
    const resposta = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, ...(ip && { remoteip: ip }) }),
      signal: AbortSignal.timeout(10_000),
    });
    const resultado: { success?: boolean } = await resposta.json();
    return resultado.success === true;
  } catch {
    return false;
  }
}
