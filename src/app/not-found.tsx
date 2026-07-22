import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import styles from "./subpage.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content">
        <section className={styles.compactHero}>
          <div className={styles.heroInner}>
            <p className={styles.kicker}>記録が見つかりません</p>
            <h1>この手がかりは存在しないようだ。</h1>
          </div>
        </section>
        <div className={styles.readingContent}>
          <p>QRコードをもう一度読み取るか、全体マップから目的の地点を選んでください。</p>
          <div className={styles.actions}>
            <Link href="/map/" className={styles.button}>全体マップへ</Link>
            <Link href="/" className={styles.outlineButton}>トップへ戻る</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
