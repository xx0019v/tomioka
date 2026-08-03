import Image from "next/image";
import Link from "next/link";
import { OtomiArrival } from "@/components/arrival/OtomiArrival";
import { GuideCharacter } from "@/components/guide/GuideCharacter";
import { ArchiveTrace } from "@/components/immersive/ArchiveTrace";
import { ArchiveObject } from "@/components/immersive/ArchiveObjects";
import { ArtifactField } from "@/components/immersive/ArtifactField";
import { FieldMapPlate } from "@/components/immersive/FieldMapPlate";
import { SilkCityScene } from "@/components/immersive/SilkCityScene";
import { TypographyReveal } from "@/components/immersive/TypographyReveal";
import { HeroExperience } from "@/components/immersive/HeroExperience";
import { SilkTrail } from "@/components/immersive/SilkTrail";
import { ShareActions } from "@/components/site/ShareActions";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { siteConfig } from "@/data/site";
import { eventSpots } from "@/data/spots";
import { withBasePath } from "@/lib/base-path";
import styles from "./page.module.css";

const participationSteps = [
  {
    number: "壱",
    title: "スタート地点へ",
    body: (
      <>
        <span className="no-break" data-ja-unit="お富ちゃん家へ">お富ちゃん家へ</span>
        <span className="no-break" data-ja-unit="お越しください">お越しください</span>
      </>
    ),
    meta: "START",
  },
  {
    number: "弐",
    title: "参加キットを受け取る",
    body: "受付時間内に無料配布",
    meta: "RECEPTION",
  },
  {
    number: "参",
    title: "富岡の街を歩く",
    body: (
      <>
        配布キットを手に、<span className="no-break" data-ja-unit="街歩き型の物語">街歩き型の物語</span>をお楽しみください
      </>
    ),
    meta: "TOMIOKA",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <SilkTrail />
      <TypographyReveal />
      <SiteHeader />

      <main id="main-content">
        <HeroExperience
          eventDate={siteConfig.eventDate}
          location={siteConfig.location}
          duration={siteConfig.duration}
          fee={`${siteConfig.fee}・事前申込${siteConfig.registration}`}
        />
        <ArchiveTrace />

        <section id="discover" className={styles.signal} aria-labelledby="signal-heading">
          <ArtifactField variant="discover" />
          <div className={styles.signalCopy}>
            <p className={styles.eyebrow}>TOMIOKA</p>
            <h2 id="signal-heading" data-line-reveal="waiting"><span>記憶は</span><span>富岡の街に眠る</span></h2>
            <p>富岡製糸場周辺の商店街を<span className="no-break" data-ja-unit="歩きながら、">歩きながら、</span>街の景色と物語を楽しむ約60〜90分の体験です。</p>
            <Link href="/information/">開催概要を確認 <span aria-hidden="true">↗</span></Link>
          </div>
          <dl className={styles.eventManifest} aria-label="イベントの特徴">
            <div className={styles.dateEntry}>
              <dt>開催日</dt>
              <dd><strong>08</strong><i aria-hidden="true">/</i><strong>08</strong></dd>
              <span className="no-break">2026年 土曜</span>
            </div>
            <div><dt>場所</dt><dd className="no-break">富岡製糸場周辺</dd><span>商店街を歩く物語</span></div>
            <div><dt>参加</dt><dd className="no-break">参加無料</dd><span className="no-break">事前申込不要</span></div>
          </dl>
        </section>

        <section id="story" className={styles.story} aria-labelledby="story-heading">
          <ArtifactField variant="story" />
          <figure className={styles.storyVisual}>
            <Image
              src={withBasePath("/images/story-silk.webp")}
              alt="繭から細い生糸が引き出された研究資料の情景"
              fill
              loading="eager"
              sizes="(max-width: 760px) 100vw, 48vw"
            />
            <figcaption>手記、明治五年——</figcaption>
          </figure>
          <div className={styles.storyContent}>
            <p className={styles.eyebrow}>あらすじ</p>
            <h2 id="story-heading" data-line-reveal="waiting"><span>街が守った</span><span>繭の記録</span></h2>
            <div className={styles.storyText}>
              <p>明治五年。富岡の街に、一人の研究者がいた。</p>
              <p>カイコの糸に生涯を捧げた女性——<span className="no-break" data-ja-unit="永山 繭">永山 繭</span>。</p>
              <p>彼女は息を引き取る間際、こう言い残したという。</p>
              <blockquote>「私が遺したものを、いつかだれかが見つけてくれる。それまで、この街が守ってくれるはずだ」</blockquote>
              <p>それから百五十年。あなたのもとに、一通の依頼が届いた。</p>
              <p>——彼女が街に遺した「謎の地図」を、<span className="no-break" data-ja-unit="探し出してほしい。">探し出してほしい。</span></p>
            </div>
            {/* 記録紙の端から、きぬが物語に寄り添う */}
            <GuideCharacter
              placement="information"
              expression="thinking"
              initiallyOpen={false}
              lines={["この記録の先に", "富岡の街があるよ"]}
              reactions={[
                { lines: ["繭は街の記憶を", "糸に変えていたんだ"], expression: "neutral" },
                { lines: ["絹糸の先をたどってみて"], expression: "pointing" },
                { lines: ["百五十年前の紙が", "まだ残っているよ"], expression: "discovery" },
              ]}
            />
          </div>
        </section>

        <section id="how-to-play" className={styles.howTo} aria-labelledby="howto-heading">
          <ArtifactField variant="howto" />
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>参加のしかた</p>
            <h2 id="howto-heading" data-line-reveal="waiting"><span>富岡の街へ</span><span>物語を歩きに行く</span></h2>
            <p>当日は<span className="no-break" data-ja-unit="お富ちゃん家">お富ちゃん家</span>で参加キットを受け取り、富岡の街並みとともに物語をお楽しみください。</p>
          </header>

          <span className={styles.stepObjects} aria-hidden="true">
            <ArchiveObject name="wax-seal" tilt={-8} />
          </span>
          <ol className={styles.steps}>
            {participationSteps.map((step) => (
              <li key={step.number}>
                <div className={styles.stepNumber}><span>{step.number}</span><small>{step.meta}</small></div>
                <div><h3>{step.title}</h3><p>{step.body}</p></div>
                <i aria-hidden="true">→</i>
              </li>
            ))}
          </ol>
          <div className={styles.howToFooter}>
            <GuideCharacter
              placement="information"
              expression="pointing"
              initiallyOpen={false}
              lines={["三つの記録を", "順にたどろう"]}
              reactions={[
                { lines: ["はじまりは", "お富ちゃん家だよ"], expression: "greeting" },
                { lines: ["キットを受け取ったら", "街へ出発しよう"], expression: "discovery" },
                { lines: ["大切なのは", "街をよく見ること"], expression: "thinking" },
              ]}
            />
            <Link href="/information/" className={styles.primaryCta}>参加案内を見る <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section id="route" className={styles.route} aria-labelledby="route-heading">
          {/* 紙の図版が土台。WebGL が使えない・reduce のときはこれだけが残る */}
          <FieldMapPlate />
          {/* その上で、スクロールに合わせて古地図から街が組み上がる。
              施設名・開催情報・CTA は canvas に描かず、DOM のまま下に置いてある */}
          <SilkCityScene />
          <header className={styles.routeHeader}>
            <p className={styles.eyebrow}>手がかりの地図</p>
            <h2 id="route-heading" data-line-reveal="waiting"><span>街を歩く道は</span><span>ひとつの地図に</span></h2>
            <p>受付、街歩きの目印、休憩地点。当日たどる{eventSpots.length}か所は、街歩きマップにまとめています。</p>
          </header>
          {/* 街が組み上がるあいだの距離。ここには情報を置かない。
              読み終えたころに、下の索引と CTA へ到達する */}
          <div className={styles.routeFormation} aria-hidden="true" />
          <ol className={styles.routeIndex}>
            {eventSpots.map((spot) => (
              <li key={spot.id}>
                <span className={styles.routeIndexMark} aria-hidden="true">{spot.marker}</span>
                <span className={styles.routeIndexName}>{spot.name}</span>
                <span className={styles.routeIndexKind}>{spot.categoryLabel}</span>
              </li>
            ))}
          </ol>
          <Link href="/map/" className={styles.routeCta}>
            <ArchiveObject name="map-pin" className={styles.ctaObject} />
            街歩きマップを開く <span aria-hidden="true">↗</span>
          </Link>
        </section>

        <OtomiArrival />

        <section id="share" className={styles.share} aria-labelledby="share-heading">
          <ArtifactField variant="share" />
          <p className={styles.shareFolio} aria-hidden="true">繭が遺した地図 — 富岡</p>
          <div>
            <p className={styles.eyebrow}>誘いの一筆</p>
            <h2 id="share-heading" data-line-reveal="waiting"><span>この物語を</span><span>誰と歩く？</span></h2>
            <p>一緒に街を歩く人へ、イベント情報を共有できます。</p>
          </div>
          <ShareActions
            text={`富岡まち歩き謎解き「${siteConfig.title}」 ${siteConfig.eventDate}開催`}
            url={siteConfig.siteUrl}
          />
          {/* ページの終わり。繭へ戻るような余韻を残す */}
          <GuideCharacter
            placement="information"
            expression="pleased"
            initiallyOpen={false}
            lines={["富岡で待っているよ"]}
            reactions={[
              { lines: ["絹糸はここで", "ひとまず休むね"], expression: "loading" },
              { lines: ["街歩きマップも", "見ておいてね"], expression: "map-reading" },
              { lines: ["また会おう"], expression: "greeting" },
            ]}
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
