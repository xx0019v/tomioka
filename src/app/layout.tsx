import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { EventBanner } from "@/components/site/EventBanner";
import { siteConfig } from "@/data/site";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
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
    description: "富岡の街を歩き、4つの手がかりを集めるリアル謎解きイベント。",
  },
  alternates: { canonical: siteConfig.siteUrl },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c241f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSerifJP.variable} ${notoSansJP.variable}`}>
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
