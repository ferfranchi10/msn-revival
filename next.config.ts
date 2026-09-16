import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // firebase-admin arrastra jwks-rsa/jose, que rompe con ERR_REQUIRE_ESM si Turbopack
  // lo empaqueta dentro de la función serverless. Se deja como módulo nativo de Node.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
