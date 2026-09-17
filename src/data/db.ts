import "server-only";
import postgres from "postgres";

// Reaproveita a conexão entre hot reloads no dev, senão cada save abre um pool novo
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    max: 5,
    transform: { undefined: null },
  });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
