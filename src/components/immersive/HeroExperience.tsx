"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArchivePrelude } from "./ArchivePrelude";
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

    const pointer = { x: 0.58, y: 0.42 };
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let visible = true;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      draw(performance.now());
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const cx = pointer.x * width;
      const cy = pointer.y * height;
      const motion = reducedMotion ? 0 : time * 0.00028;

      for (let index = 0; index < 38; index += 1) {
        const ratio = index / 37;
        const baseY = height * (0.08 + ratio * 0.88);
        const wave = Math.sin(index * 0.72 + motion * 8) * (18 + ratio * 18);
        const pull = (cy - baseY) * (0.08 + Math.sin(ratio * Math.PI) * 0.15);
        const alpha = 0.035 + Math.sin(ratio * Math.PI) * 0.075;
        const palette = index % 11 === 0 ? "205, 68, 44" : index % 4 === 0 ? "198, 162, 89" : "232, 223, 198";

        context.beginPath();
        context.moveTo(-40, baseY + wave);
        context.bezierCurveTo(
          width * 0.28,
          baseY - wave * 0.7,
          cx + Math.cos(index * 0.47 + motion) * width * 0.16,
          cy + pull + Math.sin(index) * 34,
          width + 40,
          baseY - wave * 0.45,
        );
        context.strokeStyle = `rgba(${palette}, ${alpha})`;
        context.lineWidth = index % 9 === 0 ? 1.25 : 0.7;
        context.stroke();
      }

      const halo = context.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.34);
      halo.addColorStop(0, "rgba(205, 172, 95, 0.11)");
      halo.addColorStop(0.46, "rgba(205, 172, 95, 0.035)");
      halo.addColorStop(1, "rgba(205, 172, 95, 0)");
      context.fillStyle = halo;
      context.fillRect(0, 0, width, height);
    };

    const animate = (time: number) => {
      if (!running) return;
      draw(time);
      raf = window.requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    const startAnimation = () => {
      if (running || !visible || reducedMotion) return;
      running = true;
      raf = window.requestAnimationFrame(animate);
    };

    const handlePointer = (event: PointerEvent) => {
      const bounds = section.getBoundingClientRect();
      pointer.x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      pointer.y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      section.style.setProperty("--pointer-x", `${pointer.x - 0.5}`);
      section.style.setProperty("--pointer-y", `${pointer.y - 0.5}`);
      if (reducedMotion) draw(performance.now());
    };

    let scrollTicking = false;
    const handleScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        const bounds = section.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -bounds.top / Math.max(bounds.height, 1)));
        section.style.setProperty("--hero-progress", progress.toFixed(3));
        scrollTicking = false;
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startAnimation();
      else stopAnimation();
    });
    observer.observe(section);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        stopAnimation();
        draw(performance.now());
      } else {
        startAnimation();
      }
    };

    resize();
    startAnimation();
    section.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    motionQuery.addEventListener("change", handleMotionPreference);

    return () => {
      stopAnimation();
      observer.disconnect();
      section.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      motionQuery.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero} aria-labelledby="hero-title">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />

      <div className={styles.stage}>
        <div className={styles.dateBadge}>
          <span>一日限定</span>
          <strong>{eventDate}</strong>
        </div>

        <div className={styles.evidence} aria-hidden="true">
          <div className={styles.evidenceGlow} />
          <div className={styles.evidenceCard}>
            <Image
              src="/images/hero-archive.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 700px) 48vw, 28vw"
            />
            <span>ARCHIVE / 1872</span>
          </div>
          <i className={`${styles.clue} ${styles.clueA}`}>A</i>
          <i className={`${styles.clue} ${styles.clueB}`}>B</i>
          <i className={`${styles.clue} ${styles.clueC}`}>C</i>
          <i className={`${styles.clue} ${styles.clueD}`}>D</i>
        </div>

        <div className={styles.copy}>
          <p className={styles.kicker}>TOMIOKA IMMERSIVE MYSTERY</p>
          <h1 id="hero-title">
            <span>街は、まだ</span>
            <span>記憶している。</span>
          </h1>
          <p className={styles.title}>繭が遺した地図</p>
          <p className={styles.lead}>富岡の街に散らばった4つの言葉。歩き、観察し、百五十年前の記録を完成させよ。</p>
          <ArchivePrelude />
          <div className={styles.actions}>
            <Link href="/game/" className={styles.primary}>調査を始める <span aria-hidden="true">↗</span></Link>
            <Link href="/map/" className={styles.secondary}>全体マップを見る <span aria-hidden="true">→</span></Link>
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
