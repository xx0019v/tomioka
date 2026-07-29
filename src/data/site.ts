export type EventState = "scheduled" | "open" | "cancelled" | "ended";

export const siteConfig = {
  title: "繭が遺した地図",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://xx0019v.github.io/tomioka",
  eventState: "scheduled" as EventState,
  eventDate: "2026年8月8日（土）",
  reception: "9:00〜15:00",
  finish: "16:00",
  duration: "約60〜90分",
  location: "富岡製糸場周辺商店街",
  fee: "無料",
  registration: "不要",
  audience: "どなたでも参加可能",
  weather: "雨天決行・荒天時中止",
  start: {
    name: "お富ちゃん家",
    formalName: "まちなか観光物産館 お富ちゃん家",
    address: "群馬県富岡市富岡1151-1",
    access: "上信電鉄 上州富岡駅から徒歩約10分",
  },
  contact: null as string | null,
  emergency: {
    enabled: false,
    tone: "notice" as "notice" | "warning" | "cancelled",
    title: "開催情報",
    message: "当日の最新情報はここに表示します。",
  },
};
