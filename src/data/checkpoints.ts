/**
 * チェックポイントの公開情報。
 * 謎本文・答え・キーワードの実値は、謎制作担当の確定データを受領するまで入れない。
 */

export type CheckpointSourceStatus = "confirmed" | "needs_review" | "pending";

export interface Checkpoint {
  id: string;
  slug: string;
  order: number;
  shortName: string;
  name: string;
  formalName?: string;
  role: "start-goal" | "checkpoint" | "solve-annex";
  keyword: "A" | "B" | "C" | "D" | null;
  tags: string[];
  description: string;
  address: string;
  openingHours: string | null;
  closedDays: string | null;
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
  sourceStatus: CheckpointSourceStatus;
  visualSrc: string;
  visualAlt: string;
  notice: string | null;
  sourceLabel: string;
}

function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const checkpoints: Checkpoint[] = [
  {
    id: "start",
    slug: "otomi-chan-ie",
    order: 0,
    shortName: "S/G",
    name: "お富ちゃん家",
    formalName: "富岡市観光案内所 お富ちゃん家",
    role: "start-goal",
    keyword: null,
    tags: ["スタート・ゴール", "屋内", "キット配布"],
    description: "ここから調査が始まる。繭が遺した言葉を読み、街へと踏み出せ。",
    address: "群馬県富岡市富岡1430-1",
    openingHours: "8:30-17:00",
    closedDays: "年中無休",
    googleMapsUrl: googleMapsSearchUrl("お富ちゃん家 群馬県富岡市富岡1430-1"),
    latitude: 36.25845,
    longitude: 138.892532,
    sourceStatus: "confirmed",
    visualSrc: "/checkpoints/start.svg",
    visualAlt: "お富ちゃん家の地点記号。現地写真は準備中です。",
    notice: "上州富岡駅から徒歩約5分。周辺の有料駐車場をご利用ください。",
    sourceLabel: "Webサイト制作仕様書 v2",
  },
  {
    id: "cp1",
    slug: "atelier",
    order: 1,
    shortName: "01",
    name: "アトリエ",
    role: "checkpoint",
    keyword: "A",
    tags: ["屋内", "かき氷", "目安5-8分"],
    description: "繭が考えに詰まると足を向けた場所。最初の手がかりはここに眠っている。",
    address: "群馬県富岡市富岡1045",
    openingHours: "11:00-18:00（夏季営業）",
    closedDays: "水曜日",
    googleMapsUrl: googleMapsSearchUrl("アトリエ 群馬県富岡市富岡1045"),
    latitude: 36.256855,
    longitude: 138.890991,
    sourceStatus: "needs_review",
    visualSrc: "/checkpoints/atelier.svg",
    visualAlt: "アトリエの地点記号。現地写真は準備中です。",
    notice: "イベント当日の営業状況は運営からの最終案内をご確認ください。",
    sourceLabel: "富岡市観光公式サイト（公開情報・要当日確認）",
  },
  {
    id: "cp2",
    slug: "okashige",
    order: 2,
    shortName: "02",
    name: "岡重",
    formalName: "岡重肉店",
    role: "checkpoint",
    keyword: null,
    tags: ["屋外", "ホルモン揚げ", "滞在2-3分"],
    description: "工女たちと歩いたこの路地に、繭の記憶が残る。手がかりを頭に入れ、隣で考えよ。",
    address: "群馬県富岡市富岡1051-3",
    openingHours: "公開情報あり（当日運営確認）",
    closedDays: "水曜日",
    googleMapsUrl: googleMapsSearchUrl("岡重肉店 群馬県富岡市富岡1051-3"),
    latitude: 36.2572204,
    longitude: 138.8909415,
    sourceStatus: "needs_review",
    visualSrc: "/checkpoints/okashige.svg",
    visualAlt: "岡重の地点記号。現地写真は準備中です。",
    notice: "ここでは問題を確認し、銀座まちなか交流館へ移動してから解いてください。店先に長く立ち止まらないでください。",
    sourceLabel: "謎制作ガイド・公開店舗情報（要当日確認）",
  },
  {
    id: "annex",
    slug: "ginza-koryukan",
    order: 2.5,
    shortName: "休",
    name: "銀座まちなか交流館",
    role: "solve-annex",
    keyword: "B",
    tags: ["屋内", "無料休憩所", "CP02解答地点"],
    description: "岡重で読んだ手がかりは、ここで考えよ。座って、頭を整理する場所。",
    address: "群馬県富岡市富岡19-1",
    openingHours: "9:00-17:00",
    closedDays: "年末",
    googleMapsUrl: googleMapsSearchUrl("銀座まちなか交流館 群馬県富岡市富岡19-1"),
    latitude: 36.256874,
    longitude: 138.889328,
    sourceStatus: "needs_review",
    visualSrc: "/checkpoints/koryukan.svg",
    visualAlt: "銀座まちなか交流館の地点記号。現地写真は準備中です。",
    notice: "CP02の問題を落ち着いて解くための休憩地点です。施設利用者への配慮をお願いします。",
    sourceLabel: "富岡市観光公式サイト（独立ページ化は運営確認事項）",
  },
  {
    id: "cp3",
    slug: "kirinya",
    order: 3,
    shortName: "03",
    name: "キリンヤ",
    formalName: "キリンヤ洋品店",
    role: "checkpoint",
    keyword: "C",
    tags: ["屋外", "製糸場正門前", "観察型"],
    description: "繭が毎日通り過ぎたこの場所に、見落とされた痕跡がある。よく見ろ。",
    address: "群馬県富岡市富岡1072",
    openingHours: null,
    closedDays: null,
    googleMapsUrl: googleMapsSearchUrl("キリンヤ洋品店 群馬県富岡市富岡1072"),
    latitude: 36.257519,
    longitude: 138.888199,
    sourceStatus: "needs_review",
    visualSrc: "/checkpoints/kirinya.svg",
    visualAlt: "キリンヤの地点記号。現地写真は準備中です。",
    notice: "歩行者と店舗利用者の通行を妨げない場所で確認してください。",
    sourceLabel: "公開電話帳情報（営業時間・当日利用は要確認）",
  },
  {
    id: "cp4",
    slug: "cafe-drome",
    order: 4,
    shortName: "04",
    name: "カフェドローム",
    formalName: "CAFÉ DRÔME",
    role: "checkpoint",
    keyword: "D",
    tags: ["屋内", "古民家", "目安10-15分"],
    description: "繭が最後に辿り着いた場所。焦るな。落ち着いて、この空間と向き合え。",
    address: "群馬県富岡市富岡51-4",
    openingHours: "平日11:00-15:00 / 土日祝11:00-17:00（L.O.）",
    closedDays: "木曜日＋店舗カレンダー",
    googleMapsUrl: googleMapsSearchUrl("CAFE DROME 群馬県富岡市富岡51-4"),
    latitude: 36.254192,
    longitude: 138.889709,
    sourceStatus: "needs_review",
    visualSrc: "/checkpoints/cafedelorme.svg",
    visualAlt: "カフェドロームの地点記号。現地写真は準備中です。",
    notice: "最新の営業日は店舗公式案内と当日運営情報をご確認ください。",
    sourceLabel: "店舗公式サイト（公開情報・要当日確認）",
  },
];

export function getCheckpointBySlug(slug: string): Checkpoint | undefined {
  return checkpoints.find((checkpoint) => checkpoint.slug === slug);
}

export function getOrderedCheckpoints(): Checkpoint[] {
  return [...checkpoints].sort((a, b) => a.order - b.order);
}

export function getRoutableCheckpoints(): Checkpoint[] {
  return getOrderedCheckpoints();
}
