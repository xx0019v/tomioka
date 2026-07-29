import type { Metadata } from "next";
import Link from "next/link";
import { ArtifactField } from "@/components/immersive/ArtifactField";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { siteConfig } from "@/data/site";
import styles from "../subpage.module.css";

export const metadata: Metadata = {
  title: "開催情報・参加案内",
  description: "開催日時、参加方法、受付場所、アクセス、雨天時の対応、安全上の注意事項。",
};

export default function InformationPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content">
        <section className={styles.compactHero}>
          <ArtifactField variant="information" />
          <div className={styles.heroInner}>
            <p className={styles.kicker}>ご参加の前に</p>
            <h1><span>開催情報</span><span>参加案内</span></h1>
            <p className={styles.lead}>開催概要、受付場所、参加方法をまとめています。</p>
          </div>
        </section>

        <div className={styles.readingContent}>
          <div className={styles.sections}>
            <section className={styles.section} aria-labelledby="event-facts">
              <h2 id="event-facts">開催概要</h2>
              <dl className={styles.facts}>
                <div><dt>イベント名</dt><dd>{siteConfig.title}</dd></div>
                <div><dt>開催日</dt><dd>{siteConfig.eventDate}</dd></div>
                <div><dt>場所</dt><dd>{siteConfig.location}</dd></div>
                <div><dt>受付</dt><dd>{siteConfig.reception}</dd></div>
                <div><dt>終了予定</dt><dd>{siteConfig.finish}</dd></div>
                <div><dt>所要時間</dt><dd>{siteConfig.duration}</dd></div>
                <div><dt>参加費</dt><dd>{siteConfig.fee}</dd></div>
                <div><dt>事前申込</dt><dd>{siteConfig.registration}</dd></div>
                <div><dt>対象</dt><dd>{siteConfig.audience}</dd></div>
                <div><dt>雨天</dt><dd>{siteConfig.weather}</dd></div>
                <div><dt>スタート</dt><dd>{siteConfig.start.name}</dd></div>
                <div><dt>駐車場</dt><dd>周辺の有料駐車場</dd></div>
              </dl>
            </section>

            <section className={styles.section} aria-labelledby="participation">
              <h2 id="participation">参加方法</h2>
              <ol className={styles.participation}>
                <li><span>01</span><div><h3>スタート地点へ</h3><p>お富ちゃん家へお越しください</p></div></li>
                <li><span>02</span><div><h3>参加キットを受け取る</h3><p>受付時間内に無料で受け取れます</p></div></li>
                <li><span>03</span><div><h3>富岡の街を歩く</h3><p>配布キットを手に、街歩き型の物語をお楽しみください</p></div></li>
              </ol>
            </section>

            <section className={styles.section} aria-labelledby="start-access">
              <h2 id="start-access">スタート地点・アクセス</h2>
              <div className={styles.panel}>
                <p><strong>{siteConfig.start.formalName}</strong></p>
                <p>{siteConfig.start.address}</p>
                <p>{siteConfig.start.access}</p>
                <p>車でお越しの方は、周辺の有料駐車場をご利用ください。</p>
                <a
                  className={styles.inlineLink}
                  href="https://www.google.com/maps/search/?api=1&query=%E3%81%8A%E5%AF%8C%E3%81%A1%E3%82%83%E3%82%93%E5%AE%B6%20%E7%BE%A4%E9%A6%AC%E7%9C%8C%E5%AF%8C%E5%B2%A1%E5%B8%82%E5%AF%8C%E5%B2%A11151-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Googleマップで開く
                </a>
              </div>
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
                <li>体調が悪いときは無理をせず、日陰や屋内で休んでください。</li>
              </ul>
            </section>

            <section className={styles.section} aria-labelledby="web-use">
              <h2 id="web-use">現在地とプライバシー</h2>
              <div className={styles.panel}>
                <p>「現在地を表示」を押したときだけ位置情報を取得します。位置情報をサーバー、GA4、端末内の保存領域へ送信・保存しません。</p>
                <p>利用を許可しない場合も、街歩きマップとアクセス情報を確認できます。</p>
              </div>
            </section>
          </div>

          <div className={styles.actions}>
            <Link href="/map/" className={styles.button}>街歩きマップを見る</Link>
            <Link href="/" className={styles.outlineButton}>トップへ戻る</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
