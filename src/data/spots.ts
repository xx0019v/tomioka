import { withBasePath } from "@/lib/base-path";
import { siteConfig } from "@/data/site";

export type SpotSourceStatus = "confirmed" | "day_of_event";
export type SpotCategory = "start" | "story" | "rest";

export interface EventSpot {
  id: string;
  slug: string;
  marker: string;
  name: string;
  formalName?: string;
  category: SpotCategory;
  categoryLabel: string;
  tags: string[];
  description: string;
  relation: string;
  address: string;
  openingHours: string | null;
  closedDays: string | null;
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
  sourceStatus: SpotSourceStatus;
  visualSrc: string;
  visualAlt: string;
  visualCredit: string;
  visualSourceUrl: string;
  notice: string | null;
  sourceLabel: string;
}

function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const eventSpots: EventSpot[] = [
  {
    id: "start",
    slug: "otomi-chan-ie",
    marker: "始",
    name: siteConfig.start.name,
    formalName: siteConfig.start.formalName,
    category: "start",
    categoryLabel: "スタート地点・観光案内",
    tags: ["スタート地点", "屋内", "観光案内"],
    description: "参加キットを受け取る、街歩きの入口。受付を済ませ、富岡の街へ物語をたどりに出発します。",
    relation: siteConfig.start.access,
    address: siteConfig.start.address,
    openingHours: null,
    closedDays: null,
    googleMapsUrl: siteConfig.start.googleMapsUrl,
    latitude: siteConfig.start.latitude,
    longitude: siteConfig.start.longitude,
    sourceStatus: "confirmed",
    visualSrc: withBasePath("/spots/photos/otomi-chan-ie.webp"),
    visualAlt: "まちなか観光物産館 お富ちゃん家の外観",
    visualCredit: "写真：しるくるとみおか掲載素材（利用許諾確認済み）",
    visualSourceUrl: "https://www.tomioka-silk.jp/_shop/souvenir/detail/Otomi-chan-chi.html",
    notice: "イベント受付は9:00〜15:00です。",
    sourceLabel: "富岡市観光公式サイト（2026年8月3日確認）",
  },
  {
    id: "atelier",
    slug: "atelier",
    marker: "街",
    name: "アトリエ",
    category: "story",
    categoryLabel: "街歩きスポット",
    tags: ["屋内", "かき氷", "商店街"],
    description: "季節の甘味を楽しめる、商店街の小さな休息所。富岡の日常とイベントの空気が交わる場所です。",
    relation: "お富ちゃん家から徒歩圏内",
    address: "群馬県富岡市富岡1045",
    openingHours: "11:00〜18:00（夏季営業）",
    closedDays: "水曜日",
    googleMapsUrl: googleMapsSearchUrl("アトリエ 群馬県富岡市富岡1045"),
    latitude: 36.256855,
    longitude: 138.890991,
    sourceStatus: "day_of_event",
    visualSrc: withBasePath("/spots/photos/atelier.webp"),
    visualAlt: "かき氷とクレープの案内が並ぶアトリエの外観",
    visualCredit: "写真：しるくるとみおか掲載素材（利用許諾確認済み）",
    visualSourceUrl: "https://www.tomioka-silk.jp/_shop/restaurant/detail/id%3D6488",
    notice: "イベント当日の営業状況は、店舗と運営の最新案内をご確認ください。",
    sourceLabel: "富岡市観光公式サイト（公開情報・要当日確認）",
  },
  {
    id: "okashige",
    slug: "okashige",
    marker: "街",
    name: "岡重",
    formalName: "岡重肉店",
    category: "story",
    categoryLabel: "街歩きスポット",
    tags: ["店先", "商店街", "ホルモン揚げ"],
    description: "長く街の暮らしを支えてきた肉店。店構えや手書きの札に、富岡の商いの時間が残ります。",
    relation: "お富ちゃん家から徒歩圏内",
    address: "群馬県富岡市富岡1051-3",
    openingHours: "当日の案内をご確認ください",
    closedDays: "水曜日",
    googleMapsUrl: googleMapsSearchUrl("岡重肉店 群馬県富岡市富岡1051-3"),
    latitude: 36.2572204,
    longitude: 138.8909415,
    sourceStatus: "day_of_event",
    visualSrc: withBasePath("/spots/photos/okashige.webp"),
    visualAlt: "店頭のショーケースと手書きの商品札が見える岡重肉店の外観",
    visualCredit: "写真：しるくるとみおか掲載素材（利用許諾確認済み）",
    visualSourceUrl: "https://www.tomioka-silk.jp/_shop/restaurant/detail/Okaju-meat.html",
    notice: "店舗入口や歩道をふさがず、通行する方へご配慮ください。",
    sourceLabel: "富岡市観光公式サイト（公開情報・要当日確認）",
  },
  {
    id: "ginza",
    slug: "ginza-koryukan",
    marker: "休",
    name: "銀座まちなか交流館",
    category: "rest",
    categoryLabel: "休憩スポット",
    tags: ["屋内", "無料休憩所", "トイレ"],
    description: "白壁と瓦屋根が目印のまちなか交流館。暑さを避けてひと息つける、街歩きの休憩地点です。",
    relation: "お富ちゃん家周辺",
    address: "群馬県富岡市富岡19-1",
    openingHours: "9:00〜17:00",
    closedDays: "年末",
    googleMapsUrl: googleMapsSearchUrl("銀座まちなか交流館 群馬県富岡市富岡19-1"),
    latitude: 36.256874,
    longitude: 138.889328,
    sourceStatus: "day_of_event",
    visualSrc: withBasePath("/spots/photos/ginza-koryukan.webp"),
    visualAlt: "白壁と瓦屋根の銀座まちなか交流館の外観",
    visualCredit: "写真：しるくるとみおか掲載素材（利用許諾確認済み）",
    visualSourceUrl: "https://www.tomioka-silk.jp/_spot/sightseeing/detail/ginza.html",
    notice: "施設を利用する方と譲り合い、静かに休憩してください。",
    sourceLabel: "富岡市観光公式サイト（公開情報・要当日確認）",
  },
  {
    id: "kirinya",
    slug: "kirinya",
    marker: "街",
    name: "キリンヤ",
    formalName: "キリンヤ洋品店 周辺",
    category: "story",
    categoryLabel: "街歩きスポット",
    tags: ["屋外", "赤煉瓦", "富岡製糸場"],
    description: "富岡製糸場の正門と赤煉瓦を間近に感じる一角。産業の記憶と現在の街並みが隣り合います。",
    relation: "富岡製糸場正門前",
    address: "群馬県富岡市富岡1072-4",
    openingHours: null,
    closedDays: null,
    googleMapsUrl: googleMapsSearchUrl("キリンヤ洋品店 群馬県富岡市富岡1072-4"),
    /*
     * 座標根拠（2026-08-03）:
     * 現在値は Yahoo!マップのキリンヤ洋品店 POI（住所表記 1072-4）に合わせている。
     * Mapion の掲載点・住所表記 1072-3 とは約28mの差があるが、外部資料だけでは
     * 施設入口の一点を確定できない。建物／POI位置としては維持し、入口へ変更する場合は
     * 現地確認または担当教員の確認を必須とする。推測による再調整は行わない。
     */
    latitude: 36.25773372,
    longitude: 138.88893693,
    sourceStatus: "day_of_event",
    visualSrc: withBasePath("/spots/photos/kirinya-gate-context.webp"),
    visualAlt: "赤煉瓦塀と丸形郵便ポストが見える富岡製糸場表門",
    visualCredit: "画像提供：富岡市・富岡製糸場（利用許諾確認済み）",
    visualSourceUrl: "https://www.tomioka-silk.jp/_spot/freedownload/",
    notice: "歩道に立ち止まる際は、周囲の通行を妨げないようご注意ください。",
    sourceLabel: "富岡市観光公式サイト・富岡製糸場公開素材",
  },
  {
    id: "drome",
    slug: "cafe-drome",
    marker: "街",
    name: "カフェドローム",
    formalName: "CAFÉ DRÔME",
    category: "story",
    categoryLabel: "街歩きスポット",
    tags: ["屋内", "古民家", "製糸場近く"],
    description: "日本で最初期の民間フランス語学校に由来する建物を活かしたカフェ。静かな室内に街の歴史が重なります。",
    relation: "富岡製糸場正門の南側",
    address: "群馬県富岡市富岡51-4",
    openingHours: "平日11:00〜15:00 / 土日祝11:00〜17:00（L.O.）",
    closedDays: "木曜日＋店舗カレンダー",
    googleMapsUrl: googleMapsSearchUrl("CAFE DROME 群馬県富岡市富岡51-4"),
    latitude: 36.255608,
    longitude: 138.889552,
    sourceStatus: "day_of_event",
    visualSrc: withBasePath("/spots/photos/cafe-drome.webp"),
    visualAlt: "木枠の入口から店内が見えるカフェドロームの外観",
    visualCredit: "写真：しるくるとみおか掲載素材（利用許諾確認済み）",
    visualSourceUrl: "https://www.tomioka-silk.jp/_shop/restaurant/detail/cafedrome.html",
    notice: "最新の営業日は店舗公式案内と当日運営情報をご確認ください。",
    sourceLabel: "富岡市観光公式サイト・店舗公式サイト（要当日確認）",
  },
];
