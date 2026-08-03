import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  // 開発サーバのみ。127.0.0.1 で開くと dev リソースが cross-origin 扱いになり
  // クライアント JS が hydrate されず、E2E が実質 SSR HTML だけを見てしまう。
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
