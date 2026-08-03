import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { EventBanner } from "@/components/site/EventBanner";
import { SilkVeilTransition } from "@/components/immersive/SilkVeilTransition";
import { siteConfig } from "@/data/site";
import { withBasePath } from "@/lib/base-path";
import "leaflet/dist/leaflet.css";
import "./globals.css";

/**
 * OGP 画像などの絶対 URL を組み立てる基点。
 *
 * canonical と og:url は「正式 URL」を指す（そこが本来の公開先のため）。
 * 一方 metadataBase は「いま配信している場所」でなければならない。
 * basePath 付きでビルドすると Next は metadataBase + basePath で画像 URL を作るので、
 * 正式 URL を基点にすると `https://mayu-no-chizu.cid-ac.com/tomioka/opengraph-image.jpg`
 * という存在しない URL が出力される（実際に出ていた）。
 * basePath がある = GitHub Pages 配信なので、その origin を基点にする。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const deploymentOrigin =
  process.env.NEXT_PUBLIC_DEPLOY_ORIGIN ??
  (basePath ? "https://xx0019v.github.io" : siteConfig.siteUrl);

// metadataBase は正式 URL のまま。ここを配信元へ変えると Next が
// canonical / og:url を再正規化し、末尾スラッシュが落ちてしまう。
const metadataOrigin = new URL(siteConfig.siteUrl);

// OGP 画像だけは「いま配信している場所」の絶対 URL で出す。
// metadataBase 任せにすると basePath が正式ドメインへ接ぎ木され、
// https://mayu-no-chizu.cid-ac.com/tomioka/... という存在しない URL になる。
const ogImageUrl = new URL(
  `${basePath}/opengraph-image.jpg`,
  deploymentOrigin,
).toString();

export const metadata: Metadata = {
  metadataBase: metadataOrigin,
  title: {
    default: "繭が遺した地図｜富岡まち歩き謎解き",
    template: "%s｜繭が遺した地図",
  },
  description:
    "富岡製糸場周辺の商店街を舞台にした、まち歩き型リアル謎解きイベント「繭が遺した地図」。2026年8月8日（土）開催。",
  openGraph: {
    title: "繭が遺した地図｜富岡まち歩き謎解き",
    description:
      "富岡製糸場周辺の商店街を舞台にした、まち歩き型リアル謎解きイベント。2026年8月8日（土）開催。",
    url: siteConfig.siteUrl,
    siteName: "繭が遺した地図",
    locale: "ja_JP",
    type: "website",
    images: [{ url: ogImageUrl, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "繭が遺した地図｜富岡まち歩き謎解き",
    description: "2026年8月8日、富岡製糸場周辺商店街で開催するまち歩き型リアル謎解きイベント。",
    images: [ogImageUrl],
  },
  // 末尾スラッシュ付きの正式 URL をそのまま出す。
  // 文字列で渡すと metadataBase 基準で正規化され、スラッシュが落ちる。
  alternates: { canonical: siteConfig.siteUrl },
  manifest: withBasePath("/manifest.webmanifest"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#153029",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <a className="skip-link" href="#main-content">本文へ移動</a>
        <EventBanner />
        {/* 画面の切り替えは黒幕ではなく、一枚の絹布が横切る */}
        <SilkVeilTransition />
        {children}
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        </Suspense>
      </body>
    </html>
  );
}
