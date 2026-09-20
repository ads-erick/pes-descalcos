import "server-only";
import postgres from "postgres";

// Na Vercel cada instância serverless abre o próprio pool, então as conexões precisam
// ser poucas e voltar pro pooler quando a instância fica ociosa, senão o Supabase
// esgota o limite de conexões com o site no ar.
const url = process.env.DATABASE_URL!;
// Pooler em modo transação (porta 6543) não guarda prepared statements entre as queries.
// URL inválida (ou faltando) não derruba o build: quem reclama é a primeira query.
function porta(valor: string) {
  try {
    return new URL(valor).port;
  } catch {
    return "";
  }
}
const modoTransacao = porta(url) === "6543";

// Reaproveita a conexão entre hot reloads no dev, senão cada save abre um pool novo
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export const sql =
  globalForDb.sql ??
  postgres(url, {
    max: 5,
    // Devolve a conexão pro pooler depois de 20s parada
    idle_timeout: 20,
    prepare: !modoTransacao,
    transform: { undefined: null },
  });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
