import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { siteConfig } from "@/data/site";
import styles from "../subpage.module.css";

export const metadata: Metadata = {
  title: "開催情報・注意事項",
  description: "開催日時、受付、参加条件、雨天時の対応、安全上の注意事項。",
};

export default function InformationPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content">
        <section className={styles.compactHero}>
          <div className={styles.heroInner}>
            <p className={styles.kicker}>参加前に確認</p>
            <h1>開催情報・注意事項</h1>
            <p className={styles.lead}>安全に街を歩き、店舗や地域の方々に配慮して参加してください。</p>
          </div>
        </section>

        <div className={styles.readingContent}>
          <div className={styles.sections}>
            <section className={styles.section} aria-labelledby="event-facts">
              <h2 id="event-facts">開催概要</h2>
              <dl className={styles.facts}>
                <div><dt>開催日</dt><dd>{siteConfig.eventDate}</dd></div>
                <div><dt>場所</dt><dd>{siteConfig.location}</dd></div>
                <div><dt>受付</dt><dd>{siteConfig.reception}</dd></div>
                <div><dt>終了</dt><dd>{siteConfig.finish}</dd></div>
                <div><dt>所要時間</dt><dd>{siteConfig.duration}</dd></div>
                <div><dt>参加費</dt><dd>{siteConfig.fee}</dd></div>
                <div><dt>対象</dt><dd>どなたでも参加できます</dd></div>
                <div><dt>スタート</dt><dd>お富ちゃん家</dd></div>
              </dl>
            </section>

            <section className={styles.section} aria-labelledby="weather">
              <h2 id="weather">雨天・荒天時</h2>
              <div className={styles.panel}>
                <p>雨天決行です。荒天の場合は中止し、当日朝にサイト上部のお知らせで案内します。</p>
                <p className={styles.notice}>開催可否は、運営からの最新表示を必ず確認してください。</p>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="safety">
              <h2 id="safety">街歩きの注意</h2>
              <ul className={styles.safetyList}>
                <li>歩きながらスマートフォンを操作しないでください。</li>
                <li>車道へ出ず、信号と交通ルールを守ってください。</li>
                <li>店舗入口や歩道をふさがないでください。</li>
                <li>展示物や建物には、許可なく触れないでください。</li>
                <li>飲み物と帽子を用意し、こまめに休憩してください。</li>
                <li>体調が悪いときは無理をせず、運営へ知らせてください。</li>
              </ul>
            </section>

            <section className={styles.section} aria-labelledby="web-use">
              <h2 id="web-use">Webサイトの利用</h2>
              <div className={styles.panel}>
                <p>進捗はこの端末のブラウザ内に保存します。閲覧履歴やサイトデータを消去すると、進捗表示が初期化される場合があります。</p>
                <p>アクセス状況、ヒント利用、回答結果、シェアボタン利用をGA4で集計します。入力した答えそのものは解析データへ送信しません。</p>
              </div>
            </section>
          </div>

          <div className={styles.actions}>
            <Link href="/map/" className={styles.button}>マップを見る</Link>
            <Link href="/game/" className={styles.outlineButton}>調査を始める</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
