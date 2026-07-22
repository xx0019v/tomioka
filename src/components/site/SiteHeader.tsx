import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="繭が遺した地図 トップへ">
          <span className={styles.mark} aria-hidden="true">繭</span>
          <span>繭が遺した地図</span>
        </Link>
        <nav className={styles.nav} aria-label="サイト内ナビゲーション">
          <Link href="/map/">マップ</Link>
          <Link href="/information/">開催情報</Link>
          <Link href="/game/" className={styles.gameLink}>調査を始める</Link>
        </nav>
      </div>
    </header>
  );
}
