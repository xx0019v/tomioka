export type GuideExpression =
  | "greeting"
  | "neutral"
  | "pointing"
  | "map-reading"
  | "discovery"
  | "thinking"
  | "pleased"
  | "concerned"
  | "caution"
  | "loading"
  | "clear"
  /* 視線だけが動く状態。表情を変えずに「見ている」を伝える */
  | "looking-left"
  | "looking-right"
  /* 街を歩いている状態。脚の位置と体の傾きだけが変わる */
  | "walking";

/**
 * 繭標（まゆしるべ・愛称「きぬ」）— カイコの幼虫をモチーフにした案内役のインラインSVG。
 *
 * ラスター画像ではなくSVGで描くことで、
 *  - 全表情でシルエット・体型・模様の一貫性を保証（別キャラ化しない）
 *  - 屋外・低速回線でも軽量（数KB）
 *  - 200%ズーム・任意DPRでも輪郭が崩れない
 *  - 富岡のブランド色で正確に着彩できる
 * を満たす。表情は目・口・小道具のみを差し替え、体は共通。
 *
 * 識別要素（全ポーズで維持）:
 *  - ミルキーホワイトの節のある体
 *  - 尾角（カイコ特有の小さな角）
 *  - 首元の桑の葉タグ
 *  - 引いている一本の絹糸（赤煉瓦色）
 */

type FaceKind =
  | "calm"
  | "smile"
  | "look"
  | "look-back"
  | "down"
  | "happy"
  | "worried"
  | "rest";

const faceForExpression: Record<GuideExpression, FaceKind> = {
  greeting: "smile",
  neutral: "calm",
  pointing: "look",
  "map-reading": "down",
  discovery: "happy",
  thinking: "down",
  pleased: "happy",
  concerned: "worried",
  caution: "worried",
  loading: "rest",
  clear: "happy",
  "looking-left": "look-back",
  "looking-right": "look",
  walking: "smile",
};

function Eyes({ face }: { face: FaceKind }) {
  const eye = "#3a3a34";
  if (face === "happy") {
    // 穏やかな弧の目（にっこり）
    return (
      <g data-rig="eyes" data-kinu-eyes fill="none" stroke={eye} strokeWidth="2.4" strokeLinecap="round">
        <path d="M70 55.5c1.6-2.1 4.4-2.1 6 0" />
        <path d="M82 55.5c1.6-2.1 4.4-2.1 6 0" />
      </g>
    );
  }
  if (face === "rest") {
    // 休息・読み込み（半分閉じた目）
    return (
      <g data-rig="eyes" data-kinu-eyes fill="none" stroke={eye} strokeWidth="2.4" strokeLinecap="round">
        <path d="M70 57c1.8 1.4 4.2 1.4 6 0" />
        <path d="M82 57c1.8 1.4 4.2 1.4 6 0" />
      </g>
    );
  }
  const dy = face === "down" ? 2.4 : 0;
  const dx = face === "look" ? 1.6 : face === "look-back" ? -1.8 : 0;
  return (
    <g data-rig="eyes" data-kinu-eyes fill={eye}>
      <ellipse cx={73 + dx} cy={56 + dy} rx="1.9" ry="2.6" />
      <ellipse cx={85 + dx} cy={56 + dy} rx="1.9" ry="2.6" />
      {/* やわらかなハイライト（大きすぎるアニメ目にしない） */}
      <circle cx={72.3 + dx} cy={55 + dy} r="0.6" fill="#fdfcf7" />
      <circle cx={84.3 + dx} cy={55 + dy} r="0.6" fill="#fdfcf7" />
      {face === "worried" && (
        <g fill="none" stroke={eye} strokeWidth="1.8" strokeLinecap="round">
          <path d="M69.5 51.5c1.6-.9 3.4-.9 5 .1" />
          <path d="M81.5 51.6c1.6-1 3.4-1 5-.1" />
        </g>
      )}
    </g>
  );
}

function Mouth({ face }: { face: FaceKind }) {
  const ink = "#8a5b3a";
  if (face === "happy" || face === "smile") {
    return <path d="M76 62.5c2 2.4 5 2.4 7 0" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />;
  }
  if (face === "worried") {
    return <path d="M77 63.5c1.4-1.2 3.6-1.2 5 0" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />;
  }
  if (face === "rest") {
    return <path d="M78 62.8h3.5" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />;
  }
  // calm / look / down: 小さな点の口
  return <circle cx="79.6" cy="62.6" r="1.1" fill={ink} />;
}

export interface SilkwormMascotProps {
  expression?: GuideExpression;
  /** マーカー用などの簡略版（顔の小道具を省き視認性優先） */
  simplified?: boolean;
  title?: string;
  className?: string;
}

export function SilkwormMascot({
  expression = "neutral",
  simplified = false,
  title,
  className,
}: SilkwormMascotProps) {
  const face = faceForExpression[expression] ?? "calm";

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="silk-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fefcf6" />
          <stop offset="0.5" stopColor="#f6ecd6" />
          <stop offset="1" stopColor="#dfcdae" />
        </linearGradient>
        <radialGradient id="silk-sheen" cx="0.38" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g data-rig="body">
      {/* やわらかな影（接地感） */}
      <ellipse cx="58" cy="94" rx="40" ry="6.5" fill="#2b3550" opacity="0.14" />

      {/* 引いている絹糸（識別要素・赤煉瓦色）— 尾から静かに伸びる */}
      {!simplified && (
        <path
          d="M22 80c-8 1-13 6-11 12 1.6 5-1 8-6 8"
          fill="none"
          stroke="#8e2436"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        />
      )}

      {/* 尾角（カイコ特有の小さな角・識別要素） */}
      <path d="M23 70c-4-3-8-3-10 0" fill="none" stroke="#c6ac86" strokeWidth="2.2" strokeLinecap="round" />

      {/* 体（ふっくらした幼虫の胴） */}
      <path
        d="M24 78 C 17 68 22 56 38 55 C 52 54 60 60 74 60 C 85 60 90 70 82 78 C 70 87 40 88 24 78 Z"
        fill="url(#silk-body)"
        stroke="#c6ac86"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* 節（体の上のやわらかな弧・強すぎない） */}
      <g fill="none" stroke="#d3bd97" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
        <path d="M35 58c-2 6-2 12 0 18" />
        <path d="M48 59c-2 6-2 12 0 18" />
        <path d="M61 60c-2 6-2 11 0 16" />
      </g>

      {/* 小さな脚（幼虫であることの合図）。歩行時だけ前後にずれる */}
      <g fill="#e6d5b6" stroke="#c6ac86" strokeWidth="0.8">
        <circle cx="34" cy={expression === "walking" ? 85.5 : 83} r="2.6" />
        <circle cx="46" cy={expression === "walking" ? 82 : 84} r="2.6" />
        <circle cx="58" cy={expression === "walking" ? 85 : 83.5} r="2.6" />
      </g>

      {/* 首元の識別要素：臙脂の細いリボンと、真鍮色の記録タグ。
          可愛さは「大きさ」ではなく「小ささ」で作る。付けるのは 2 点まで。 */}
      {!simplified && (
        <g transform="translate(63 60) rotate(-14)">
          <path
            d="M-2 2c3-3 7-3 9 0 2-3 6-3 9 0-3 3-6 3-9 1-3 2-6 2-9-1z"
            fill="#8e2436"
          />
          <circle cx="7" cy="2.4" r="1.5" fill="#a94456" />
          <path d="M7 4v6" stroke="#b9964f" strokeWidth="0.9" strokeLinecap="round" />
          <rect x="4.4" y="9.6" width="5.6" height="7" rx="1" fill="#faf5e8" stroke="#b9964f" strokeWidth="0.8" />
          <path d="M5.8 12h2.8M5.8 14h2" stroke="#2b3550" strokeWidth="0.6" opacity="0.6" />
        </g>
      )}

      <g data-rig="head">
      {/* 頭部（丸く上品に） */}
      <circle cx="80" cy="52" r="19" fill="url(#silk-body)" stroke="#c6ac86" strokeWidth="1.4" />
      <ellipse cx="74" cy="46" rx="14" ry="11" fill="url(#silk-sheen)" opacity="0.85" />

      {/* 顔 */}
      <Eyes face={face} />
      <Mouth face={face} />

      {/* ほのかな頬（品よく・赤煉瓦を薄く） */}
      {(face === "happy" || face === "smile") && (
        <g fill="#c9765a" opacity="0.28">
          <ellipse cx="69" cy="60.5" rx="2.4" ry="1.5" />
          <ellipse cx="90" cy="60.5" rx="2.4" ry="1.5" />
        </g>
      )}

      {/* 到達・喜びの小さな煌めき（控えめ） */}
      {(expression === "clear" || expression === "discovery") && !simplified && (
        <g fill="#b9964f">
          <path d="M99 34l1.4 3.2 3.2 1.4-3.2 1.4-1.4 3.2-1.4-3.2-3.2-1.4 3.2-1.4z" />
        </g>
      )}
      </g>
      </g>
    </svg>
  );
}
