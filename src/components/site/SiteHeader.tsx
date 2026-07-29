import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="繭が遺した地図 トップへ">
          <span className={styles.mark} aria-hidden="true"><span /></span>
          <span>繭が遺した地図</span>
        </Link>
        <nav className={styles.nav} aria-label="サイト内ナビゲーション">
          <Link href="/map/">
            <span className={styles.desktopLabel}>街歩きマップ</span>
            <span className={styles.mobileLabel}>マップ</span>
          </Link>
          <Link href="/information/" className={styles.infoLink}>開催情報</Link>
        </nav>
      </div>
    </header>
  );
}
