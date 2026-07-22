import Image from "next/image";
import Link from "next/link";
import { HeroExperience } from "@/components/immersive/HeroExperience";
import { InteractiveRoute } from "@/components/immersive/InteractiveRoute";
import { ShareActions } from "@/components/site/ShareActions";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getOrderedCheckpoints } from "@/data/checkpoints";
import { siteConfig } from "@/data/site";
import styles from "./page.module.css";

const howToPlaySteps = [
  {
    number: "01",
    title: "記録を受け取る",
    body: "お富ちゃん家で調査キットを受け取る。繭の言葉を読み、QRコードから記録を開く。",
    meta: "START / 約5分",
  },
  {
    number: "02",
    title: "街の痕跡を追う",
    body: "富岡の商店街を歩き、現地の景色や店内に残された手がかりを観察する。",
    meta: "FIELD / 約45分",
  },
  {
    number: "03",
    title: "4つの言葉を結ぶ",
    body: "集めた言葉を組み合わせ、最後の地図を完成させる。答えはゴールで確かめよう。",
    meta: "FINAL / 約10分",
  },
];

export default function Home() {
  const checkpoints = getOrderedCheckpoints();

  const routePoints = checkpoints.map((checkpoint) => ({
    id: checkpoint.id,
    slug: checkpoint.slug,
    shortName: checkpoint.shortName,
    name: checkpoint.name,
    tags: checkpoint.tags,
    latitude: checkpoint.latitude,
    longitude: checkpoint.longitude,
    role: checkpoint.role,
  }));

  return (
    <div className={styles.page}>
      <SiteHeader />

      <main id="main-content">
        <HeroExperience
          eventDate={siteConfig.eventDate}
          location={siteConfig.location}
          duration={siteConfig.duration}
          fee={siteConfig.fee}
        />

        <section id="discover" className={styles.signal} aria-labelledby="signal-heading">
          <div className={styles.signalCopy}>
            <p className={styles.eyebrow}>調査記録 / 序</p>
            <h2 id="signal-heading">百五十年前の記録は、街の中でまだ息をしている。</h2>
            <p>永山 繭が遺したのは、紙の地図だけではない。店の記憶、路地の形、建物に刻まれた小さな違和感。そのすべてが、あなたを次の地点へ導く。</p>
            <Link href="/information/">調査前の注意事項 <span aria-hidden="true">↗</span></Link>
          </div>

          <div className={styles.signalNetwork} aria-label="4つの手がかりが中央の地図へ集まる図">
            <span className={styles.networkRing} aria-hidden="true" />
            <span className={styles.networkRingOuter} aria-hidden="true" />
            <div className={styles.networkCore}>
              <small>ARCHIVE</small>
              <strong>繭</strong>
              <span>1872</span>
            </div>
            {["A", "B", "C", "D"].map((letter) => (
              <div key={letter} className={`${styles.networkNode} ${styles[`node${letter}`]}`}>
                <i>{letter}</i><span>KEYWORD</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.story} ${styles.viewReveal}`} aria-labelledby="story-heading">
          <figure className={styles.storyVisual}>
            <Image
              src="/images/story-silk.webp"
              alt="繭から細い生糸が引き出された研究資料の情景"
              fill
              sizes="(max-width: 760px) 100vw, 48vw"
            />
            <figcaption>RESEARCH NOTE / MEIJI 5</figcaption>
          </figure>
          <div className={styles.storyContent}>
            <p className={styles.eyebrow}>繭が遺した手記</p>
            <h2 id="story-heading">街が守った、ひとつの記録。</h2>
            <div className={styles.storyText}>
              <p>明治五年。富岡の街に、一人の研究者がいた。</p>
              <p>カイコの糸に生涯を捧げた女性、永山 繭。彼女は息を引き取る間際、こう言い残したという。</p>
              <blockquote>「私が遺したものを、いつかだれかが見つけてくれる。それまで、この街が守ってくれるはずだ」</blockquote>
              <p>それから百五十年。あなたのもとに、一通の依頼が届いた。</p>
              <p>彼女が街に遺した「謎の地図」を、探し出してほしい。</p>
            </div>
          </div>
        </section>

        <section id="how-to-play" className={styles.howTo} aria-labelledby="howto-heading">
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>調査手順 / 三段階</p>
            <h2 id="howto-heading">街を歩くことが、物語を進める。</h2>
            <p>必要なのは配布キットとスマートフォン。画面の中だけでは完結しない、約60〜90分の調査です。</p>
          </header>

          <ol className={styles.steps}>
            {howToPlaySteps.map((step) => (
              <li key={step.number} className={styles.viewReveal}>
                <div className={styles.stepNumber}><span>{step.number}</span><small>{step.meta}</small></div>
                <div><h3>{step.title}</h3><p>{step.body}</p></div>
                <i aria-hidden="true">→</i>
              </li>
            ))}
          </ol>
          <Link href="/game/" className={styles.primaryCta}>調査画面を開く <span aria-hidden="true">↗</span></Link>
        </section>

        <section id="route" className={styles.route} aria-labelledby="route-heading">
          <header className={styles.routeHeader}>
            <p className={styles.eyebrow}>巡回記録 / 実座標概念図</p>
            <h2 id="route-heading">巡回5地点と、ひとつの補助地点。</h2>
            <p>集める言葉は4つ。岡重で手掛かりを読み、銀座まちなか交流館で解くCP02を含む6地点の調査記録です。</p>
          </header>
          <InteractiveRoute points={routePoints} />
          <Link href="/map/" className={styles.routeCta}>全体マップと住所を見る <span aria-hidden="true">↗</span></Link>
        </section>

        <section className={`${styles.access} ${styles.viewReveal}`} aria-labelledby="access-heading">
          <div className={styles.accessIntro}>
            <p className={styles.eyebrow}>始点・帰着点</p>
            <h2 id="access-heading">すべては、<br />お富ちゃん家から。</h2>
            <p>富岡市観光案内所でキットを受け取り、調査を始めてください。</p>
          </div>
          <dl>
            <div><dt>ADDRESS</dt><dd>群馬県富岡市富岡1430-1</dd></div>
            <div><dt>ACCESS</dt><dd>上信電鉄 上州富岡駅から徒歩約5分</dd></div>
            <div><dt>RECEPTION</dt><dd>{siteConfig.reception}</dd></div>
            <div><dt>PARKING</dt><dd>周辺の有料駐車場をご利用ください</dd></div>
          </dl>
          <div className={styles.accessActions}>
            <a href="https://www.google.com/maps/search/?api=1&query=%E3%81%8A%E5%AF%8C%E3%81%A1%E3%82%83%E3%82%93%E5%AE%B6%20%E7%BE%A4%E9%A6%AC%E7%9C%8C%E5%AF%8C%E5%B2%A1%E5%B8%82%E5%AF%8C%E5%B2%A11430-1" target="_blank" rel="noopener noreferrer">Googleマップで開く <span aria-hidden="true">↗</span></a>
            <Link href="/information/">開催情報を確認</Link>
          </div>
        </section>

        <section className={styles.share} aria-labelledby="share-heading">
          <div>
            <p className={styles.eyebrow}>同行者への連絡</p>
            <h2 id="share-heading">この調査を、<br />誰と始める？</h2>
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
