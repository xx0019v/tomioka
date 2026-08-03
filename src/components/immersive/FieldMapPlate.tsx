import styles from "./FieldMapPlate.module.css";

/**
 * 配布キット p4/p5「手がかりの地図」の版面を、Web の背景として引き直したもの。
 *
 * 実在の地図ではない。緯度経度も持たない。
 * 実際の地点・現在地・順路は Leaflet の街歩きマップだけが扱う。
 * ここは「紙の地図がそこに置かれている」ことだけを伝える図版で、
 * 情報は一切載せない（読むための文字はすべて DOM 側にある）。
 */
export function FieldMapPlate() {
  return (
    <svg
      className={styles.plate}
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* 茶色の道。太い通りと細い路地で、キットと同じ濃淡をつける */}
      <g className={styles.roadMinor} fill="none" strokeLinecap="round">
        <path d="M-20 176h1240M-20 372h1240M-20 548h1240" />
        <path d="M172 -20v740M398 -20v740M642 -20v740M886 -20v740M1064 -20v740" />
        <path d="M62 96h300M840 268h340M280 640h420" />
      </g>
      <g className={styles.roadMajor} fill="none" strokeLinecap="round">
        <path d="M-20 268C210 258 470 292 720 276s340-40 520-52" />
        <path d="M520 -20c14 210 -8 350 26 740" />
      </g>

      {/* 臙脂の破線の順路。矢印はキットと同じ向きで一つだけ */}
      <path
        className={styles.route}
        d="M244 574C368 500 402 396 540 356s258 22 372-56"
        fill="none"
      />
      <path className={styles.routeHead} d="M912 296l26 6-20 18z" />

      {/* 方位記号 */}
      <g transform="translate(1082 108)">
        <circle className={styles.compassRing} r="30" fill="none" />
        <path className={styles.compassSouth} d="M0-28 7 0 0 28 -7 0Z" />
        <path className={styles.compassNorth} d="M0-28 7 0 0 0Z" />
      </g>

      {/* 縮尺 */}
      <g transform="translate(96 626)">
        <path className={styles.scaleBar} d="M0 0h96" fill="none" />
        <path className={styles.scaleBar} d="M0-6v12M96-6v12" fill="none" />
      </g>
    </svg>
  );
}
