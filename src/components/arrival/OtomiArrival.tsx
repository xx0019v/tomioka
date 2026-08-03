"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SilkwormMascot, type GuideExpression } from "@/components/guide/SilkwormMascot";
import { ArchiveObject } from "@/components/immersive/ArchiveObjects";
import { siteConfig } from "@/data/site";
import { withBasePath } from "@/lib/base-path";
import styles from "./OtomiArrival.module.css";

const messages: ReadonlyArray<{ lines: readonly [string, string]; expression: GuideExpression }> = [
  { lines: ["ここが物語の入口", "お富ちゃん家だよ"], expression: "greeting" },
  { lines: ["上州富岡駅から", "歩いて5分ほど"], expression: "pointing" },
  { lines: ["受付でキットを受け取ったら", "街へ出発しよう"], expression: "discovery" },
  { lines: ["受付は15時まで", "時間に余裕をもってね"], expression: "thinking" },
];
const routeSteps = ["上州富岡駅", "富岡の街", "お富ちゃん家", "物語の入口"];

export function OtomiArrival() {
  const sectionRef = useRef<HTMLElement>(null);
  const lastTapRef = useRef(0);
  const [entered, setEntered] = useState(false);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [reactTick, setReactTick] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [override, setOverride] = useState<(typeof messages)[number] | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle");
  const guide = override ?? messages[step];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intersecting = false;
    const update = () => {
      setActive(!motionQuery.matches && !document.hidden && intersecting);
      if (intersecting) setEntered(true);
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = Boolean(entry?.isIntersecting);
      update();
    }, { rootMargin: "10% 0px", threshold: 0.08 });
    observer.observe(section);
    motionQuery.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    let blinkTimer = 0;
    let finishTimer = 0;
    let disposed = false;
    const schedule = () => {
      blinkTimer = window.setTimeout(() => {
        if (disposed) return;
        setBlinking(true);
        finishTimer = window.setTimeout(() => {
          setBlinking(false);
          if (!disposed) schedule();
        }, 180);
      }, 3500 + Math.round(Math.random() * 4500));
    };
    schedule();
    return () => {
      disposed = true;
      window.clearTimeout(blinkTimer);
      window.clearTimeout(finishTimer);
    };
  }, [active]);

  function reactToGuide() {
    const now = Date.now();
    if (now - lastTapRef.current < 220) return;
    lastTapRef.current = now;
    setOverride(null);
    setStep((value) => (value + 1) % messages.length);
    setReactTick((value) => value + 1);
  }

  function guideToMap() {
    setOverride({ lines: ["場所を地図で確認できるよ", "入口で待っているね"], expression: "pointing" });
    setReactTick((value) => value + 1);
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(siteConfig.start.address);
      setCopyState("success");
      setOverride({ lines: ["住所をコピーしたよ", "地図で確かめてね"], expression: "pleased" });
    } catch {
      setCopyState("error");
      setOverride({ lines: ["コピーできなかったよ", "住所を長押ししてね"], expression: "concerned" });
    }
  }

  return (
    <section ref={sectionRef} id="access" className={styles.arrival} data-entered={entered} data-active={active} aria-labelledby="access-heading">
      <span className={styles.folio} aria-hidden="true">富岡 — 出発・帰還の地</span>
      <header className={styles.heading}>
        <p className={styles.kicker}>物語の入口</p>
        <h2 id="access-heading" aria-label="物語の入口は、お富ちゃん家">
          <span>物語の入口は、</span><strong>お富ちゃん家</strong>
        </h2>
        <p>まずはここで参加キットを受け取り、富岡の街へ出発します。</p>
      </header>

      <figure className={styles.place}>
        <div className={styles.photo}>
          <Image src={withBasePath("/spots/photos/otomi-chan-ie.webp")} alt="富岡の街にある、お富ちゃん家の建物外観" fill sizes="(max-width: 767px) 100vw, 52vw" />
          <span aria-hidden="true">出発の地 — 壱</span>
        </div>
        <figcaption><span>受付場所</span><strong>{siteConfig.start.name}</strong><small>富岡市観光案内所</small></figcaption>
      </figure>

      <div className={styles.ticket}>
        <span className={styles.ticketObjects} aria-hidden="true">
          <ArchiveObject name="cocoon-box" tilt={-6} />
          <ArchiveObject name="old-key" tilt={9} />
        </span>
        <div className={styles.stamp} aria-hidden="true"><span>到着</span><b>08.08</b></div>
        <address><span>住所</span><strong>{siteConfig.start.address}</strong></address>
        <button type="button" className={styles.copyButton} onClick={copyAddress}>{copyState === "success" ? "コピーしました" : "住所をコピー"}</button>
        <p className={styles.copyStatus} role="status">{copyState === "error" ? "コピーできませんでした。住所を長押ししてください。" : ""}</p>
        <dl className={styles.facts}>
          <div><dt>アクセス</dt><dd>{siteConfig.start.access}</dd></div>
          <div><dt>受付時間</dt><dd>{siteConfig.reception}</dd></div>
          <div><dt>参加条件</dt><dd>{siteConfig.fee}・事前申込{siteConfig.registration}</dd></div>
        </dl>
      </div>

      <aside className={styles.guide} aria-label="きぬの受付案内">
        <div className={styles.bubble} role="status"><small>きぬ — 受付案内</small><p><span>{guide.lines[0]}</span><span>{guide.lines[1]}</span></p></div>
        <button type="button" onClick={reactToGuide} aria-label="きぬにふれて次の受付案内を見る">
          <span className={styles.mascot} data-active={active} data-blinking={blinking} data-react={reactTick % 2} aria-hidden="true">
            <SilkwormMascot expression={guide.expression} />
          </span>
          <span>きぬに聞く</span>
        </button>
      </aside>

      <nav className={styles.route} aria-label="上州富岡駅から物語の入口まで">
        <p>駅から入口まで</p>
        <ol>{routeSteps.map((label, index) => (
          <li key={label} style={{ "--route-index": index } as CSSProperties}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong></li>
        ))}</ol>
      </nav>

      <div className={styles.actions}>
        <a className={styles.primary} href={siteConfig.start.googleMapsUrl} target="_blank" rel="noopener noreferrer" onFocus={guideToMap} onPointerDown={guideToMap}><span>Googleマップで開く</span><i aria-hidden="true">↗</i></a>
        <Link href="/map/">街歩きマップを見る <span aria-hidden="true">→</span></Link>
        <Link href="/information/">開催情報を確認 <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
