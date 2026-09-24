import type { NextConfig } from "next";

// Vale pra todas as páginas. Não é uma CSP completa (bloquear scripts exigiria nonce e
// deixaria todas as páginas dinâmicas), só as diretivas que não quebram nada: ninguém
// embute o site num iframe (clickjacking no admin), nem troca a base dos links, nem
// manda formulário pra fora, nem carrega plugin. O HSTS a Vercel já manda.
const cabecalhosDeSeguranca = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  // O mesmo que o frame-ancestors, pra navegador antigo
  { key: "X-Frame-Options", value: "DENY" },
  // O navegador não "adivinha" o tipo do arquivo: um texto não vira script
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Pra outros sites vai só o domínio, nunca o caminho da página
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // O site não usa câmera, microfone nem localização (a foto vem do seletor de arquivo)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Só vale no `next dev`: sem isso, abrir pelo IP da rede (pra testar no celular)
  // bloqueia os assets de desenvolvimento e a página não hidrata
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  // A tela de rankings virou "Estatísticas": link antigo salvo no WhatsApp continua abrindo
  async redirects() {
    return [{ source: "/rankings", destination: "/estatisticas", permanent: true }];
  },
  async headers() {
    return [{ source: "/:path*", headers: cabecalhosDeSeguranca }];
  },
  images: {
    // Fotos das cartinhas, no bucket público do Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/fotos/**",
      },
    ],
  },
};

export default nextConfig;
