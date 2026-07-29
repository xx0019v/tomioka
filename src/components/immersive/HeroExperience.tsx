"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { withBasePath } from "@/lib/base-path";
import { ArtifactField } from "./ArtifactField";
import styles from "./HeroExperience.module.css";

interface HeroExperienceProps {
  eventDate: string;
  location: string;
  duration: string;
  fee: string;
}

export function HeroExperience({ eventDate, location, duration, fee }: HeroExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pointer = { x: 0.58, y: 0.42 };
    let width = 0;
    let height = 0;
    let raf = 0;
    let motionEnabled = false;
    let inView = true;

    const resize = () => {
      const bounds = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      requestDraw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const cx = pointer.x * width;
      const cy = pointer.y * height;
      // 静かな絹糸のレイヤー。常時ループはせず、視線位置に応じて一度描き直すだけ。
      for (let index = 0; index < 26; index += 1) {
        const ratio = index / 25;
        const baseY = height * (0.08 + ratio * 0.88);
        const wave = Math.sin(index * 0.72) * (16 + ratio * 14);
        const pull = (cy - baseY) * (0.06 + Math.sin(ratio * Math.PI) * 0.12);
        const alpha = 0.03 + Math.sin(ratio * Math.PI) * 0.05;
        const palette = index % 6 === 0 ? "198, 162, 89" : "232, 223, 198";

        context.beginPath();
        context.moveTo(-40, baseY + wave);
        context.bezierCurveTo(
          width * 0.28,
          baseY - wave * 0.7,
          cx + Math.cos(index * 0.47) * width * 0.14,
          cy + pull + Math.sin(index) * 30,
          width + 40,
          baseY - wave * 0.45,
        );
        context.strokeStyle = `rgba(${palette}, ${alpha})`;
        context.lineWidth = index % 9 === 0 ? 1.1 : 0.65;
        context.stroke();
      }
    };

    const requestDraw = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(draw);
    };

    const handlePointer = (event: PointerEvent) => {
      if (!inView || event.pointerType === "touch") return;
      const bounds = section.getBoundingClientRect();
      pointer.x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      pointer.y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      section.style.setProperty("--pointer-x", `${pointer.x - 0.5}`);
      section.style.setProperty("--pointer-y", `${pointer.y - 0.5}`);
      requestDraw();
    };

    let scrollTicking = false;
    const handleScroll = () => {
      if (!inView || scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        const bounds = section.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -bounds.top / Math.max(bounds.height, 1)));
        section.style.setProperty("--hero-progress", progress.toFixed(3));
        scrollTicking = false;
      });
    };

    const syncMotionPreference = () => {
      if (motionQuery.matches) {
        if (motionEnabled) {
          section.removeEventListener("pointermove", handlePointer);
          window.removeEventListener("scroll", handleScroll);
        }
        motionEnabled = false;
        pointer.x = 0.58;
        pointer.y = 0.42;
        section.style.setProperty("--pointer-x", "0");
        section.style.setProperty("--pointer-y", "0");
        section.style.setProperty("--hero-progress", "0");
        requestDraw();
        return;
      }

      section.removeEventListener("pointermove", handlePointer);
      if (finePointerQuery.matches) {
        section.addEventListener("pointermove", handlePointer, { passive: true });
      }
      if (!motionEnabled) {
        window.addEventListener("scroll", handleScroll, { passive: true });
        motionEnabled = true;
      }
      handleScroll();
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        if (inView) handleScroll();
      },
      { rootMargin: "12% 0px 12% 0px", threshold: 0 },
    );

    resize();
    window.addEventListener("resize", resize, { passive: true });
    motionQuery.addEventListener("change", syncMotionPreference);
    finePointerQuery.addEventListener("change", syncMotionPreference);
    visibilityObserver.observe(section);
    syncMotionPreference();

    return () => {
      window.cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      motionQuery.removeEventListener("change", syncMotionPreference);
      finePointerQuery.removeEventListener("change", syncMotionPreference);
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero} aria-labelledby="hero-title">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />
      <ArtifactField variant="hero" />

      <div className={styles.stage}>
        <div className={styles.dateBadge}>
          <span>一日限定</span>
          <strong>{eventDate}</strong>
        </div>

        <div className={styles.evidence} aria-hidden="true">
          <div className={styles.evidenceCard}>
            <Image
              src={withBasePath("/images/hero-archive-800.jpg")}
              alt=""
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 700px) 48vw, 28vw"
            />
            <span>再構成 / MEIJI</span>
          </div>
        </div>

        <div className={styles.copy}>
          <p className={styles.kicker}>まち歩き型リアル謎解きイベント</p>
          <h1 id="hero-title">
            <span>繭が遺した</span>
            <span>地図</span>
          </h1>
          <p className={styles.title}>街は、まだ記憶している</p>
          <p className={styles.lead}>絹の記憶をたどり、富岡の街へ。百五十年前の物語が、街並みの中であなたを待っています。</p>
          <div className={styles.actions}>
            <Link href="/information/" className={styles.primary}>開催情報を見る <span aria-hidden="true">↗</span></Link>
            <Link href="/map/" className={styles.secondary}>街歩きマップを見る <span aria-hidden="true">↗</span></Link>
          </div>
        </div>

        <div className={styles.scrollCue} aria-hidden="true">
          <span>SCROLL TO DISCOVER</span>
          <i />
        </div>
      </div>

      <dl className={styles.facts} aria-label="イベント基本情報">
        <div><dt>AREA</dt><dd>{location}</dd></div>
        <div><dt>TIME</dt><dd>{duration}</dd></div>
        <div><dt>ENTRY</dt><dd>{fee}</dd></div>
      </dl>
    </section>
  );
}
