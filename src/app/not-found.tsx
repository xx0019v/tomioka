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
            <p className={styles.kicker}>該当の頁がありません</p>
            <h1>ページが見つかりません</h1>
          </div>
        </section>
        <div className={styles.readingContent}>
          <p>URLをご確認いただくか、トップまたは街歩きマップから目的の情報をお探しください。</p>
          <div className={styles.actions}>
            <Link href="/map/" className={styles.button}>街歩きマップへ</Link>
            <Link href="/" className={styles.outlineButton}>トップへ戻る</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
