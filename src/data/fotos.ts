import "server-only";

// Fotos das cartinhas no Supabase Storage, pela API REST (não precisa do supabase-js)
const BUCKET = "fotos";
export const FOTO_TIPOS = ["image/jpeg", "image/png", "image/webp"] as const;
export const FOTO_TAMANHO_MAX = 1024 * 1024;

const EXTENSAO: Record<(typeof FOTO_TIPOS)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("Supabase Storage não configurado");
  return { url, headers: { apikey: chave, Authorization: `Bearer ${chave}` } };
}

// Nome novo a cada upload, pra trocar de foto não esbarrar no cache do navegador
export async function enviarFoto(jogadorId: string, foto: File): Promise<string> {
  const { url, headers } = config();
  const tipo = foto.type as keyof typeof EXTENSAO;
  const caminho = `jogadores/${jogadorId}/${Date.now()}.${EXTENSAO[tipo]}`;

  const resposta = await fetch(`${url}/storage/v1/object/${BUCKET}/${caminho}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": tipo, "Cache-Control": "31536000" },
    body: foto,
  });
  if (!resposta.ok) throw new Error(`Falha ao enviar a foto (${resposta.status})`);

  return `${url}/storage/v1/object/public/${BUCKET}/${caminho}`;
}

// Melhor esforço: se falhar, sobra só um arquivo solto no bucket
export async function apagarFoto(fotoUrl: string | null) {
  if (!fotoUrl) return;
  const { url, headers } = config();
  const prefixo = `${url}/storage/v1/object/public/${BUCKET}/`;
  if (!fotoUrl.startsWith(prefixo)) return;

  await fetch(`${url}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [fotoUrl.slice(prefixo.length)] }),
  }).catch(() => {});
}
