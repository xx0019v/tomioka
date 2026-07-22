import Image from "next/image";
import Link from "next/link";
import { ShareActions } from "@/components/site/ShareActions";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getOrderedCheckpoints } from "@/data/checkpoints";
import { siteConfig } from "@/data/site";
import styles from "./page.module.css";

const howToPlaySteps = [
  {
    number: "一",
    title: "キットを受け取る",
    body: "スタート地点「お富ちゃん家」でキットを無料で受け取る。繭の言葉を読み、QRコードからゲームを開始する。",
  },
  {
    number: "二",
    title: "街を巡る",
    body: "商店街の各チェックポイントを回り、謎を解きながら手がかりを集める。行き詰まったときはヒントを確認する。",
  },
  {
    number: "三",
    title: "謎を解いてゴール",
    body: "集めた手がかりを組み合わせて最終謎に挑戦。繭が遺した地図の意味が、今明かされる。",
  },
];

export default function Home() {
  const checkpoints = getOrderedCheckpoints().filter(
    (checkpoint) => checkpoint.role !== "solve-annex",
  );

  return (
    <div className={styles.page}>
      <SiteHeader />

      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <Image
            className={styles.heroImage}
            src="/images/hero-archive.webp"
            alt="古地図、繭、生糸、研究手記が置かれた調査机"
            fill
            priority
            sizes="100vw"
          />
          <div className={styles.heroShade} />
          <div className={styles.heroInner}>
            <p className={styles.heroLabel}>{siteConfig.eventDate} 開催</p>
            <h1 id="hero-title">繭が遺した地図</h1>
            <p className={styles.heroSubtitle}>富岡の街に散らばった手がかりを追え</p>
            <div className={styles.heroActions}>
              <Link href="#how-to-play">参加方法</Link>
              <Link href="/map/" className={styles.heroSecondary}>全体マップ</Link>
            </div>
          </div>
        </section>

        <section className={styles.eventStrip} aria-label="イベント基本情報">
          <dl>
            <div><dt>開催日</dt><dd>{siteConfig.eventDate}</dd></div>
            <div><dt>場所</dt><dd>{siteConfig.location}</dd></div>
            <div><dt>所要時間</dt><dd>{siteConfig.duration}</dd></div>
            <div><dt>参加</dt><dd>{siteConfig.fee}</dd></div>
          </dl>
        </section>

        <section className={styles.story} aria-labelledby="story-heading">
          <figure className={styles.storyVisual}>
            <Image
              src="/images/story-silk.webp"
              alt="繭から細い生糸が引き出された研究資料の情景"
              fill
              sizes="(max-width: 760px) 100vw, 42vw"
            />
          </figure>
          <div className={styles.storyContent}>
            <p className={styles.sectionLabel}>繭が遺した手記</p>
            <h2 id="story-heading">街が守った、ひとつの記録。</h2>
            <div className={styles.storyText}>
              <p>明治五年。富岡の街に、一人の研究者がいた。</p>
              <p>
                カイコの糸に生涯を捧げた女性——永山 繭。<br />
                彼女は息を引き取る間際、こう言い残したという。
              </p>
              <blockquote>
                「私が遺したものを、いつかだれかが見つけてくれる。それまで、この街が守ってくれるはずだ」
              </blockquote>
              <p>それから百五十年。あなたのもとに、一通の依頼が届いた。</p>
              <p>——彼女が街に遺した「謎の地図」を、探し出してほしい。</p>
            </div>
          </div>
        </section>

        <section id="how-to-play" className={styles.howTo} aria-labelledby="howto-heading">
          <div className={styles.sectionHeading}>
            <h2 id="howto-heading">参加からゴールまで</h2>
            <p>必要なのは、配布キットとスマートフォン。街を歩き、現地でしか得られない手がかりを集めます。</p>
          </div>
          <ol className={styles.steps}>
            {howToPlaySteps.map((step) => (
              <li key={step.number}>
                <span aria-hidden="true">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/game/" className={styles.primaryCta}>調査を始める</Link>
        </section>

        <section className={styles.route} aria-labelledby="route-heading">
          <div className={styles.routeVisual}>
            <Image
              src="/images/route-thread.webp"
              alt="4つの手がかりを朱色の絹糸で結んだ調査資料"
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
          <div className={styles.routeContent}>
            <h2 id="route-heading">4つの場所に、4つの言葉。</h2>
            <p>すべてのチェックポイントを巡らなければ、最後の地図は完成しません。</p>
            <ol className={styles.checkpoints}>
              {checkpoints.map((checkpoint) => (
                <li key={checkpoint.id}>
                  <Link href={`/checkpoints/${checkpoint.slug}/`}>
                    <span>{checkpoint.shortName}</span>
                    <div>
                      <strong>{checkpoint.name}</strong>
                      <small>{checkpoint.tags.slice(0, 2).join(" / ")}</small>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
            <Link href="/map/" className={styles.textLink}>巡回順と住所を見る</Link>
          </div>
        </section>

        <section className={styles.access} aria-labelledby="access-heading">
          <div>
            <p className={styles.sectionLabel}>スタート・ゴール</p>
            <h2 id="access-heading">お富ちゃん家</h2>
            <p className={styles.accessLead}>富岡市観光案内所でキットを受け取り、調査を始めてください。</p>
          </div>
          <dl>
            <div><dt>住所</dt><dd>群馬県富岡市富岡1430-1</dd></div>
            <div><dt>最寄り駅</dt><dd>上信電鉄 上州富岡駅から徒歩約5分</dd></div>
            <div><dt>受付</dt><dd>{siteConfig.reception}</dd></div>
            <div><dt>駐車場</dt><dd>周辺の有料駐車場をご利用ください</dd></div>
          </dl>
          <div className={styles.accessActions}>
            <a
              href="https://www.google.com/maps/search/?api=1&query=%E3%81%8A%E5%AF%8C%E3%81%A1%E3%82%83%E3%82%93%E5%AE%B6%20%E7%BE%A4%E9%A6%AC%E7%9C%8C%E5%AF%8C%E5%B2%A1%E5%B8%82%E5%AF%8C%E5%B2%A11430-1"
              target="_blank"
              rel="noopener noreferrer"
            >Googleマップで開く</a>
            <Link href="/information/">注意事項を確認</Link>
          </div>
        </section>

        <section className={styles.share} aria-labelledby="share-heading">
          <div>
            <h2 id="share-heading">調査への招待を送る</h2>
            <p>一緒に街を歩く人へ、イベント情報を共有できます。</p>
          </div>
          <ShareActions
            text={`富岡まち歩き謎解き「${siteConfig.title}」 ${siteConfig.eventDate}開催 #${siteConfig.hashtag}`}
            url={siteConfig.siteUrl}
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
