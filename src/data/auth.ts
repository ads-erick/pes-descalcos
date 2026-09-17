import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET não configurado");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compara os HMACs para não vazar o tamanho da senha pelo tempo de resposta
  return safeEqual(sign(password), sign(expected));
}

export async function startSession() {
  const expiresAt = String(Date.now() + MAX_AGE_SECONDS * 1000);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function endSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

export async function isAdmin() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE)?.value;
  if (!value || !process.env.ADMIN_SESSION_SECRET) return false;

  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature || !safeEqual(signature, sign(expiresAt))) {
    return false;
  }
  return Number(expiresAt) > Date.now();
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Não autorizado");
}
