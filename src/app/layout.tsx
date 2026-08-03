import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { EventBanner } from "@/components/site/EventBanner";
import { siteConfig } from "@/data/site";
import { withBasePath } from "@/lib/base-path";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const metadataOrigin = new URL(siteConfig.siteUrl);

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
  },
  twitter: {
    card: "summary_large_image",
    title: "繭が遺した地図｜富岡まち歩き謎解き",
    description: "2026年8月8日、富岡製糸場周辺商店街で開催するまち歩き型リアル謎解きイベント。",
  },
  alternates: { canonical: siteConfig.siteUrl },
  manifest: withBasePath("/manifest.webmanifest"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#17202f",
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
        {children}
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        </Suspense>
      </body>
    </html>
  );
}
