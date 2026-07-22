export type EventState = "scheduled" | "open" | "cancelled" | "ended";

export const siteConfig = {
  title: "繭が遺した地図",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mayu-no-chizu.cid-ac.com",
  eventState: "scheduled" as EventState,
  eventDate: "2026年8月8日（土）",
  reception: "9:00-15:00",
  finish: "16:00予定",
  duration: "約60-90分",
  location: "富岡製糸場周辺商店街",
  fee: "無料・事前申込不要",
  hashtag: "繭が遺した地図",
  contact: null as string | null,
  emergency: {
    enabled: false,
    tone: "notice" as "notice" | "warning" | "cancelled",
    title: "開催情報",
    message: "当日の最新情報はここに表示します。",
  },
};
