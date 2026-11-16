import type { NextConfig } from "next";

// 静的出力（ビルド時にすべてのページを HTML にする）。
// サーバは不要で、GitHub Pages / Cloudflare Pages にそのまま置ける。
// サブパス配信（例: GitHub Pages の /kanji_drill）のときは NEXT_PUBLIC_BASE_PATH を指定する。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
};

export default nextConfig;
