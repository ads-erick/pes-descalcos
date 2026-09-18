import { z } from "zod";

// Evita mandar pro banco um id malformado vindo da URL (o Postgres rejeita e vira erro 500)
export function ehUuid(valor: unknown): valor is string {
  return z.uuid().safeParse(valor).success;
}
