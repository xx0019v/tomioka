import styles from "./ArchiveObjects.module.css";

/**
 * 配布キットに実在する道具を、写真ではなく線と紙で描き起こしたもの。
 *
 * 写真素材は「その場に置かれた物」に見えるが、台帳の世界では強すぎて
 * 本文を押しのけてしまう。ここでは全て SVG で作り、
 *  - 文字の下に敷いても読みやすさを壊さない
 *  - 拡大しても劣化しない
 *  - 追加のネットワーク要求を一切増やさない
 * 状態にしてある。色は配布キットのインク（藍墨・臙脂・真鍮・生成り・茶）だけを使う。
 */

type ObjectName =
  | "map-pin" // 真鍮の地図ピン
  | "spool" // 木製の糸巻き
  | "cocoon-box" // 繭の小箱
  | "mulberry" // 桑の葉
  | "wax-seal" // 封蝋
  | "old-key" // 古い鍵
  | "paper-tag" // 記録用タグ
  | "ink-bottle" // インク瓶
  | "candle" // 蝋燭
  | "compass"; // 方位記号

interface ArchiveObjectProps {
  name: ObjectName;
  className?: string;
  /** 紙に留めた見た目にする（角度を少し与える） */
  tilt?: number;
}

const paths: Record<ObjectName, React.ReactNode> = {
  "map-pin": (
    <>
      <path
        d="M16 5.5c-4.1 0-7.2 3-7.2 6.9 0 4.8 5.6 10.6 6.7 11.7a.7.7 0 0 0 1 0c1.1-1.1 6.7-6.9 6.7-11.7 0-3.9-3.1-6.9-7.2-6.9Z"
        fill="var(--kit-brass)"
        stroke="var(--kit-brown-deep)"
        strokeWidth="1"
      />
      <circle cx="16" cy="12.2" r="2.6" fill="var(--kit-paper-raised)" />
      <path d="M16 24v4.6" stroke="var(--kit-brown-deep)" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  spool: (
    <>
      <rect x="7" y="6" width="18" height="3" rx="1" fill="var(--kit-brown)" />
      <rect x="7" y="23" width="18" height="3" rx="1" fill="var(--kit-brown)" />
      <path d="M11 9h10v14H11z" fill="var(--kit-cream)" />
      <g stroke="var(--kit-cocoa)" strokeWidth="0.6" opacity="0.85">
        <path d="M11 12h10M11 15h10M11 18h10M11 21h10" />
      </g>
      <path
        d="M21 16c4 1.2 6 3.4 7.6 6.4"
        fill="none"
        stroke="var(--kit-brass-soft)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </>
  ),
  "cocoon-box": (
    <>
      <path d="M5 13h22v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" fill="var(--kit-leather)" />
      <path d="M4 9h24v4H4z" fill="var(--kit-brown)" />
      <ellipse cx="12" cy="19" rx="3.4" ry="2.3" fill="var(--kit-cream)" />
      <ellipse cx="19.5" cy="21" rx="3.4" ry="2.3" fill="var(--kit-cream)" />
      <path d="M16 9V5" stroke="var(--kit-brass)" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  mulberry: (
    <>
      <path
        d="M16 4c-6 2.4-9.5 7-9.5 12.4 0 5.4 4 9.6 9.5 11.6 5.5-2 9.5-6.2 9.5-11.6C25.5 11 22 6.4 16 4Z"
        fill="none"
        stroke="var(--kit-brown)"
        strokeWidth="1.1"
      />
      <path d="M16 5.5V27" stroke="var(--kit-brown)" strokeWidth="1" />
      <g stroke="var(--kit-brown)" strokeWidth="0.7" opacity="0.8">
        <path d="M16 10.5 10.4 14M16 10.5 21.6 14M16 16 10.8 19.4M16 16 21.2 19.4" />
      </g>
    </>
  ),
  "wax-seal": (
    <>
      <circle cx="16" cy="16" r="10" fill="var(--kit-seal)" />
      <circle cx="16" cy="16" r="7.4" fill="none" stroke="var(--kit-paper-raised)" strokeWidth="0.8" opacity="0.7" />
      <path
        d="M16 11.4c-2.4 1-3.8 2.8-3.8 4.9 0 2.1 1.6 3.8 3.8 4.6 2.2-.8 3.8-2.5 3.8-4.6 0-2.1-1.4-3.9-3.8-4.9Z"
        fill="var(--kit-paper-raised)"
        opacity="0.86"
      />
    </>
  ),
  "old-key": (
    <>
      <circle cx="9" cy="16" r="5" fill="none" stroke="var(--kit-brass)" strokeWidth="1.8" />
      <path d="M14 16h13" stroke="var(--kit-brass)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M23 16v4M26 16v3" stroke="var(--kit-brass)" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  "paper-tag": (
    <>
      <path
        d="M9 6h13l5 5v15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        fill="var(--kit-paper-raised)"
        stroke="var(--kit-brown)"
        strokeWidth="1"
      />
      <circle cx="11.5" cy="10" r="1.4" fill="none" stroke="var(--kit-brown)" strokeWidth="0.9" />
      <g stroke="var(--kit-ink-dusk)" strokeWidth="0.8" opacity="0.55">
        <path d="M10 16h12M10 19h12M10 22h8" />
      </g>
    </>
  ),
  "ink-bottle": (
    <>
      <path d="M10 14h12v11a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3Z" fill="var(--kit-ink)" />
      <path d="M10 19h12v6a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3Z" fill="var(--kit-ink-deep)" />
      <rect x="12.5" y="8" width="7" height="6" rx="1" fill="var(--kit-brass)" />
      <path d="M22 12l6-6" stroke="var(--kit-brown)" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  candle: (
    <>
      <path
        d="M16 4c1.9 2.4 2.9 4.2 2.9 5.7A2.9 2.9 0 0 1 16 12.6a2.9 2.9 0 0 1-2.9-2.9C13.1 8.2 14.1 6.4 16 4Z"
        fill="var(--kit-candle)"
      />
      <rect x="12" y="13" width="8" height="13" rx="1.4" fill="var(--kit-paper-raised)" />
      <path d="M8 27h16" stroke="var(--kit-brass)" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  compass: (
    <>
      <circle cx="16" cy="16" r="11" fill="none" stroke="var(--kit-brown)" strokeWidth="1.1" />
      <path d="M16 5.6 18.6 16 16 26.4 13.4 16Z" fill="var(--kit-ink)" />
      <path d="M16 5.6 18.6 16H16Z" fill="var(--kit-seal)" />
    </>
  ),
};

export function ArchiveObject({ name, className = "", tilt = 0 }: ArchiveObjectProps) {
  return (
    <svg
      className={`${styles.object} ${className}`}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      style={tilt ? { rotate: `${tilt}deg` } : undefined}
    >
      {paths[name]}
    </svg>
  );
}
