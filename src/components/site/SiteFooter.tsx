import Link from "next/link";
import { siteConfig } from "@/data/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.title}>繭が遺した地図</p>
          <p className={styles.url}>
            <a href={siteConfig.siteUrl} target="_blank" rel="noopener noreferrer">
              {siteConfig.siteUrl}
            </a>
          </p>
        </div>
        <nav className={styles.links} aria-label="フッターナビゲーション">
          <Link href="/">トップ</Link>
          <Link href="/map/">街歩きマップ</Link>
          <Link href="/information/">開催情報</Link>
        </nav>
        <div className={styles.org}>
          <p>{siteConfig.eventDate}</p>
          <p>{siteConfig.location}</p>
          <p>{siteConfig.fee}・事前申込{siteConfig.registration}</p>
          {siteConfig.contact && <p>お問い合わせ：{siteConfig.contact}</p>}
        </div>
        <p className={styles.next}>街は、まだ記憶している</p>
      </div>
    </footer>
  );
}
