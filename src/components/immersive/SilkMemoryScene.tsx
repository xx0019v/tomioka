"use client";

import { useEffect, useRef } from "react";
import { TIER_BUDGET, detectTier, type DeviceTier } from "@/lib/device-tier";
import styles from "./SilkMemoryScene.module.css";

/**
 * THE SILK MEMORY — Hero の 3D 空間。
 *
 * 一本の絹糸が暗闇の奥へ続き、その途中に繭がある。
 * スクロール量がそのままカメラの前進量になり、糸の描画進行になる。
 *
 * 守っていること:
 *  - canvas には情報を描かない。文章はすべて DOM のまま（aria-hidden）
 *  - rAF はこのコンポーネントで 1 本だけ。画面外・タブ非表示では回さない
 *  - pin しない。スクロールを奪わない
 *  - reduced-motion / saveData / WebGL 不可 では canvas を作らない（static）
 *  - unmount で geometry / material / renderer / ScrollTrigger をすべて破棄する
 *  - context lost に対応し、復旧不能なら静かに消える（情報は DOM 側に残る）
 */
export function SilkMemoryScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // React Strict Mode の二重呼び出しで canvas を 2 枚作らない
    if (startedRef.current) return;
    startedRef.current = true;

    const tier: DeviceTier = detectTier();
    if (tier === "static") {
      startedRef.current = false;
      return;
    }
    const budget = TIER_BUDGET[tier];

    let disposed = false;
    let cleanup: (() => void) | null = null;

    // three と gsap はここでだけ必要。初期表示を遅らせないため動的に読む。
    void (async () => {
      const [THREE, gsapMod, stMod] = await Promise.all([
        import("three"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed) return;

      const gsap = gsapMod.gsap ?? gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: budget.antialias,
        powerPreference: tier === "low" ? "default" : "high-performance",
        preserveDrawingBuffer: false,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, budget.dprMax));
      renderer.setSize(width, height, false);
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.classList.add(styles.canvas);
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      // 奥へ行くほど墨に沈む。暗闇そのものを素材として扱う
      scene.fog = new THREE.FogExp2(0x07120f, 0.085);

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0.15, 6);

      // --- 絹糸 -------------------------------------------------------------
      // 奥へ続く一本の糸。手前は緩く、奥へ行くほど収束させて「続き」を感じさせる
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.9, -1.15, 3.2),
        new THREE.Vector3(-0.55, -0.3, 1.1),
        new THREE.Vector3(0.5, 0.15, -1.2),
        new THREE.Vector3(-0.25, 0.5, -3.6),
        new THREE.Vector3(0.35, 0.2, -6.4),
        new THREE.Vector3(0, 0, -9.5),
      ]);

      const threadGeometry = new THREE.TubeGeometry(
        curve,
        budget.tubularSegments,
        0.012,
        budget.radialSegments,
        false,
      );
      const threadMaterial = new THREE.MeshStandardMaterial({
        color: 0xd8c9a2,
        roughness: 0.45,
        metalness: 0.12,
        transparent: true,
        opacity: 0.95,
      });
      const thread = new THREE.Mesh(threadGeometry, threadMaterial);
      // drawRange で「描かれていく」表現にする（毎フレーム geometry を作り直さない）
      const threadIndexCount = threadGeometry.index?.count ?? 0;
      threadGeometry.setDrawRange(0, 0);
      scene.add(thread);

      // --- 繭 ---------------------------------------------------------------
      const cocoonGeometry = new THREE.IcosahedronGeometry(0.42, budget.cocoonDetail);
      cocoonGeometry.scale(0.72, 1, 0.72);
      const cocoonMaterial = new THREE.MeshStandardMaterial({
        color: 0xf1e7d0,
        roughness: 0.75,
        metalness: 0.04,
        transparent: true,
        opacity: 0,
        flatShading: budget.cocoonDetail <= 1,
      });
      const cocoon = new THREE.Mesh(cocoonGeometry, cocoonMaterial);
      cocoon.position.set(0.34, 0.16, -1.25);
      scene.add(cocoon);

      // --- 粒子（絹の繊維・紙粉） -------------------------------------------
      const positions = new Float32Array(budget.particleCount * 3);
      for (let i = 0; i < budget.particleCount; i += 1) {
        positions[i * 3] = (Math.random() - 0.5) * 9;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
        positions[i * 3 + 2] = -Math.random() * 11;
      }
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const dustMaterial = new THREE.PointsMaterial({
        color: 0xcbb98e,
        size: 0.016,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
        depthWrite: false,
      });
      const dust = new THREE.Points(dustGeometry, dustMaterial);
      scene.add(dust);

      // --- 光 ---------------------------------------------------------------
      const ambient = new THREE.AmbientLight(0xbfae86, 0.55);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffe9c4, 1.15);
      key.position.set(2.2, 2.6, 3.4);
      scene.add(key);
      const cocoonGlow = new THREE.PointLight(0xffd79a, 0, 3.2);
      cocoonGlow.position.copy(cocoon.position);
      if (tier !== "low") scene.add(cocoonGlow);

      // --- 描画ループ（1 本だけ。可視かつタブ表示中のみ回す） ----------------
      let frame = 0;
      let visible = true;
      let running = false;

      const render = () => {
        renderer.render(scene, camera);
      };

      const loop = () => {
        frame = requestAnimationFrame(loop);
        dust.rotation.y += 0.00035;
        cocoon.rotation.y += 0.0016;
        render();
      };

      const start = () => {
        if (running || !visible || document.hidden || disposed) return;
        running = true;
        frame = requestAnimationFrame(loop);
      };
      const stop = () => {
        running = false;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      };

      // --- スクロール同期 ---------------------------------------------------
      // scrub でスクロール量そのものを時間軸にする。pin はしない。
      const progress = { value: 0 };
      const trigger = ScrollTrigger.create({
        trigger: host.parentElement ?? host,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self: { progress: number }) => {
          progress.value = self.progress;
          const p = self.progress;

          // 糸が手繰られていく
          threadGeometry.setDrawRange(0, Math.floor(threadIndexCount * Math.min(1, p * 1.35)));

          // カメラが糸に沿って奥へ進む（3D 酔いを避け、移動量は控えめ）
          camera.position.z = 6 - p * 3.4;
          camera.position.x = Math.sin(p * Math.PI) * 0.32;
          camera.position.y = 0.15 + p * 0.22;
          camera.lookAt(0, 0.1, -2.4 - p * 2);

          // 繭は 25% を過ぎてから内側に光が生まれる
          const cocoonIn = Math.max(0, Math.min(1, (p - 0.25) / 0.35));
          cocoonMaterial.opacity = cocoonIn * 0.92;
          cocoonGlow.intensity = cocoonIn * 1.5;

          // 奥へ進むほど霧が薄れ、空間が開ける
          if (scene.fog instanceof THREE.FogExp2) {
            scene.fog.density = 0.085 - p * 0.03;
          }
          dustMaterial.opacity = 0.5 - p * 0.18;

          if (!running) render();
        },
      });

      // --- リサイズ ---------------------------------------------------------
      const resize = () => {
        const w = host.clientWidth || window.innerWidth;
        const h = host.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        render();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);

      // --- 画面外では回さない -----------------------------------------------
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = Boolean(entry?.isIntersecting);
          if (visible) start();
          else stop();
        },
        { threshold: 0 },
      );
      io.observe(host);

      const onVisibility = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVisibility);

      // --- context lost / restored ------------------------------------------
      const onLost = (event: Event) => {
        event.preventDefault();
        stop();
      };
      const onRestored = () => {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, budget.dprMax));
        resize();
        start();
      };
      canvas.addEventListener("webglcontextlost", onLost as EventListener);
      canvas.addEventListener("webglcontextrestored", onRestored);

      start();
      render();
      // 画像・フォント確定後にレイアウトを測り直す
      ScrollTrigger.refresh();

      cleanup = () => {
        stop();
        trigger.kill();
        io.disconnect();
        resizeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        canvas.removeEventListener("webglcontextlost", onLost as EventListener);
        canvas.removeEventListener("webglcontextrestored", onRestored);

        threadGeometry.dispose();
        threadMaterial.dispose();
        cocoonGeometry.dispose();
        cocoonMaterial.dispose();
        dustGeometry.dispose();
        dustMaterial.dispose();
        scene.clear();

        renderer.dispose();
        renderer.forceContextLoss();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
      cleanup = null;
      startedRef.current = false;
    };
  }, []);

  return <div ref={hostRef} className={styles.host} aria-hidden="true" />;
}
