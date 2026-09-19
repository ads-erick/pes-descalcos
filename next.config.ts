import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
