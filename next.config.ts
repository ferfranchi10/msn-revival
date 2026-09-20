import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // firebase-admin arrastra jwks-rsa/jose, que rompe con ERR_REQUIRE_ESM si Turbopack
  // lo empaqueta dentro de la función serverless. Se deja como módulo nativo de Node.
  serverExternalPackages: ["firebase-admin"],
  async headers() {
    return [
      {
        // El service worker nunca debe quedar cacheado: si no, los usuarios no reciben versiones nuevas.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
