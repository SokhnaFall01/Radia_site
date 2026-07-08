import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      // Les formulaires admin envoient des photos (souvent > 1 Mo depuis un
      // téléphone) ; la limite par défaut de 1 Mo faisait planter
      // l'enregistrement avant même d'atteindre le code applicatif.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
