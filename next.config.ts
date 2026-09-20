import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Só vale no `next dev`: sem isso, abrir pelo IP da rede (pra testar no celular)
  // bloqueia os assets de desenvolvimento e a página não hidrata
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
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
