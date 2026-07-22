import Link from "next/link";
import { siteConfig } from "@/data/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const displayUrl = siteConfig.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.title}>繭が遺した地図</p>
          <p className={styles.url}>{displayUrl}</p>
        </div>
        <nav className={styles.links} aria-label="フッターナビゲーション">
          <Link href="/">トップ</Link>
          <Link href="/map/">マップ</Link>
          <Link href="/information/">開催情報</Link>
          <Link href="/final/">最終回答</Link>
        </nav>
        <div className={styles.org}>
          <p>主催：中央情報大学校</p>
          <p>共催：富岡市</p>
          <p>{siteConfig.contact ? `お問い合わせ：${siteConfig.contact}` : "お問い合わせ先は確定後に掲載します。"}</p>
        </div>
        <p className={styles.next}>次回：2027年2月開催予定</p>
      </div>
    </footer>
  );
}
