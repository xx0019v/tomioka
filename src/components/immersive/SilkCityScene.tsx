"use client";

import { useEffect, useRef } from "react";
import type * as ThreeTypes from "three";
import { TIER_BUDGET, detectTier, type DeviceTier } from "@/lib/device-tier";
import styles from "./SilkCityScene.module.css";

/**
 * 古地図から富岡の街が組み上がるスクロール場面。
 *
 * スクロール量そのものが時間軸になる（pin はしない。スクロールを奪わない）。
 *
 *   0.00-0.14  暗い空間に、古地図の紙が浮かび上がる
 *   0.14-0.34  地図の道が描かれていく
 *   0.30-0.48  絹糸が道へ接続する
 *   0.42-0.70  建物が紙模型のように立ち上がる
 *   0.62-0.84  地点が順番に認識できるようになる
 *   0.84-1.00  街全体が一つの構図として静止し、CTA へ収束する
 *
 * 守っていること:
 *  - **canvas に文字を描かない。** 施設名・開催情報・CTA はすべて DOM のまま
 *  - **実緯度経度を持たない。** 街の配置は構図のための相対座標であり、
 *    Leaflet の街歩きマップの座標とは一切関係しない（混同させない）
 *  - カメラは寄るだけ。回り込み・飛行・急旋回はしない（酔わせない）
 *  - 建物は回転しない。立ち上がるのは Y スケールだけ
 *  - rAF は 1 本。画面外・タブ非表示では止める
 *  - reduce / saveData / WebGL 不可 では canvas を作らない（紙の図版だけが残る）
 *  - unmount で geometry / material / texture / renderer / ScrollTrigger を全破棄
 */

/** 街の骨格。実在の緯度経度ではなく、版面のための相対座標 */
const ROADS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[-5.6, 1.5], [-1.3, 1.05], [2.4, 1.4], [5.8, 0.95]],
  [[-5.5, -1.4], [-2.0, -1.05], [1.7, -1.4], [5.6, -1.1]],
  [[-3.4, 3.4], [-3.0, -0.2], [-2.6, -3.6]],
  [[0.6, 3.6], [0.9, 0.1], [1.2, -3.4]],
  [[4.2, 3.2], [4.0, -0.4], [3.7, -3.6]],
  [[-5.9, 0.1], [6.0, -0.15]],
];

/** 紙模型の街区。[x, z, 幅, 奥行, 高さ] */
const BLOCKS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [-4.6, 0.7, 1.5, 0.9, 0.62], [-4.4, -0.8, 1.2, 0.8, 0.44],
  [-1.9, 0.75, 1.6, 1.0, 0.78], [-1.7, -0.85, 1.4, 0.9, 0.52],
  [-0.1, 2.2, 1.0, 1.1, 0.4], [2.0, 0.7, 1.8, 1.0, 0.92],
  [2.2, -0.9, 1.3, 0.85, 0.58], [5.1, 0.65, 1.4, 0.95, 0.7],
  [5.0, -0.95, 1.1, 0.8, 0.46], [-3.1, -2.5, 1.2, 0.9, 0.36],
  [1.0, -2.4, 1.5, 0.95, 0.48], [4.3, 2.3, 1.1, 0.9, 0.42],
  [-5.4, 2.3, 1.0, 0.85, 0.34], [0.3, -3.5, 1.3, 0.8, 0.3],
];

/** 順に灯る地点。DOM の索引と同じ 6 か所ぶん（名前は canvas に描かない） */
const MARKS: ReadonlyArray<readonly [number, number]> = [
  [-4.4, 0.9], [-1.8, 0.95], [0.2, 2.3], [2.1, 0.9], [4.9, 0.8], [1.1, -2.2],
];

export function SilkCityScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const tier: DeviceTier = detectTier();
    if (tier === "static") {
      startedRef.current = false;
      return;
    }
    const budget = TIER_BUDGET[tier];
    const lowEnd = tier === "low";

    let disposed = false;
    let cleanup: (() => void) | null = null;

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
        powerPreference: lowEnd ? "default" : "high-performance",
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
      // 霧の色は紙。暗い霧を生成りの版面へ重ねると、汚れにしか見えない
      scene.fog = new THREE.FogExp2(0xe9e3d3, 0.026);

      // 望遠寄りにして、寄っても街全体が版面に収まるようにする
      const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 90);

      // --- 古地図の紙 ------------------------------------------------------
      // テクスチャは手続き的に描く。画像を 1 枚も追加読み込みしない。
      const paperSize = lowEnd ? 512 : 1024;
      const paperCanvas = document.createElement("canvas");
      paperCanvas.width = paperSize;
      paperCanvas.height = paperSize;
      const ctx = paperCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#efe8d6";
        ctx.fillRect(0, 0, paperSize, paperSize);
        // 方眼
        ctx.strokeStyle = "rgba(112, 104, 64, 0.16)";
        ctx.lineWidth = 1;
        const step = paperSize / 28;
        for (let i = 1; i < 28; i += 1) {
          ctx.beginPath();
          ctx.moveTo(i * step, 0);
          ctx.lineTo(i * step, paperSize);
          ctx.moveTo(0, i * step);
          ctx.lineTo(paperSize, i * step);
          ctx.stroke();
        }
        // 紙の斑（インクの染みと経年）
        for (let i = 0; i < (lowEnd ? 60 : 180); i += 1) {
          const r = Math.random() * paperSize * 0.09 + 6;
          const g = ctx.createRadialGradient(
            Math.random() * paperSize, Math.random() * paperSize, 0,
            Math.random() * paperSize, Math.random() * paperSize, r,
          );
          g.addColorStop(0, "rgba(122, 100, 62, 0.055)");
          g.addColorStop(1, "rgba(122, 100, 62, 0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, paperSize, paperSize);
        }
      }
      const paperTexture = new THREE.CanvasTexture(paperCanvas);
      paperTexture.colorSpace = THREE.SRGBColorSpace;
      paperTexture.anisotropy = lowEnd ? 1 : 4;

      const groundGeometry = new THREE.PlaneGeometry(16.5, 10.5, 1, 1);
      const groundMaterial = new THREE.MeshStandardMaterial({
        map: paperTexture,
        roughness: 0.95,
        metalness: 0,
        transparent: true,
        opacity: 0,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      // 紙が机に落とす影。これが無いと紙が宙に浮いた板に見える
      const shadowGeometry = new THREE.PlaneGeometry(17.6, 11.6, 1, 1);
      const shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0x5a462c,
        transparent: true,
        opacity: 0,
      });
      const sheetShadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
      sheetShadow.rotation.x = -Math.PI / 2;
      sheetShadow.position.set(0.35, -0.02, 0.3);
      scene.add(sheetShadow);

      // --- 道（描かれていく線） --------------------------------------------
      const roadPositions: number[] = [];
      for (const road of ROADS) {
        const curve = new THREE.CatmullRomCurve3(
          road.map(([x, z]) => new THREE.Vector3(x, 0.012, z)),
        );
        const points = curve.getPoints(lowEnd ? 26 : 60);
        for (let i = 0; i < points.length - 1; i += 1) {
          roadPositions.push(points[i].x, points[i].y, points[i].z);
          roadPositions.push(points[i + 1].x, points[i + 1].y, points[i + 1].z);
        }
      }
      const roadGeometry = new THREE.BufferGeometry();
      roadGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(roadPositions, 3),
      );
      const roadVertexCount = roadPositions.length / 3;
      roadGeometry.setDrawRange(0, 0);
      const roadMaterial = new THREE.LineBasicMaterial({
        color: 0x5a462c,
        transparent: true,
        opacity: 0.9,
      });
      const roads = new THREE.LineSegments(roadGeometry, roadMaterial);
      scene.add(roads);

      // --- 紙模型の街区 ----------------------------------------------------
      const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
      const blockMaterial = new THREE.MeshStandardMaterial({
        color: 0xece2c6,
        roughness: 0.88,
        metalness: 0,
        flatShading: true,
        transparent: true,
        opacity: 0,
      });
      const blocks = new THREE.InstancedMesh(blockGeometry, blockMaterial, BLOCKS.length);
      blocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(blocks);
      const matrix = new THREE.Matrix4();

      // 屋根の稜線（インク線画）。紙模型の折り目に見せる
      const edgeGeometry = new THREE.EdgesGeometry(blockGeometry);
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: 0x5a462c,
        transparent: true,
        opacity: 0,
      });
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      const edgeGroup = new THREE.Group();
      const edgeClones: ThreeTypes.LineSegments[] = [];
      if (!lowEnd) {
        for (let i = 0; i < BLOCKS.length; i += 1) {
          const clone = new THREE.LineSegments(edgeGeometry, edgeMaterial);
          edgeClones.push(clone);
          edgeGroup.add(clone);
        }
        scene.add(edgeGroup);
      }

      // --- 街をつなぐ絹糸 --------------------------------------------------
      const threadCurve = new THREE.CatmullRomCurve3(
        MARKS.map(([x, z], i) => new THREE.Vector3(x, 0.42 + (i % 2) * 0.16, z)),
      );
      const threadGeometry = new THREE.TubeGeometry(
        threadCurve,
        Math.round(budget.tubularSegments * 0.7),
        0.016,
        budget.radialSegments,
        false,
      );
      const threadIndexCount = threadGeometry.index?.count ?? 0;
      threadGeometry.setDrawRange(0, 0);
      const threadMaterial = new THREE.MeshStandardMaterial({
        color: 0xd9c48c,
        roughness: 0.4,
        metalness: 0.14,
        transparent: true,
        opacity: 0.95,
      });
      const thread = new THREE.Mesh(threadGeometry, threadMaterial);
      scene.add(thread);

      // --- 順に灯る地点（印だけ。名前は DOM 側にある） ----------------------
      const markGeometry = new THREE.RingGeometry(0.13, 0.17, lowEnd ? 12 : 24);
      const markMaterials: ThreeTypes.MeshBasicMaterial[] = [];
      const markGroup = new THREE.Group();
      for (const [x, z] of MARKS) {
        const material = new THREE.MeshBasicMaterial({
          color: 0xa33b2b,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
        });
        markMaterials.push(material);
        const ring = new THREE.Mesh(markGeometry, material);
        ring.position.set(x, 0.02, z);
        ring.rotation.x = -Math.PI / 2;
        markGroup.add(ring);
      }
      scene.add(markGroup);

      // --- 光 ---------------------------------------------------------------
      const ambient = new THREE.AmbientLight(0xd8c9a4, 0.62);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xfff0d2, 1.25);
      key.position.set(3.4, 6.2, 4.6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xa8c0a4, 0.34);
      rim.position.set(-4.2, 2.6, -3.8);
      if (!lowEnd) scene.add(rim);

      // --- 描画ループ -------------------------------------------------------
      let frame = 0;
      let visible = false;
      let running = false;

      const render = () => renderer.render(scene, camera);
      const loop = () => {
        frame = requestAnimationFrame(loop);
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

      const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
      const ramp = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));

      const apply = (p: number) => {
        // 1. 紙が浮かび上がる
        const paperIn = ramp(p, 0, 0.14);
        groundMaterial.opacity = paperIn * 0.96;
        shadowMaterial.opacity = paperIn * 0.14;

        // 2. 道が描かれる
        const drawn = ramp(p, 0.14, 0.34);
        roadGeometry.setDrawRange(0, Math.floor(roadVertexCount * drawn));
        roadMaterial.opacity = drawn * 0.9;

        // 3. 絹糸が道へ接続する
        const threaded = ramp(p, 0.3, 0.48);
        threadGeometry.setDrawRange(0, Math.floor(threadIndexCount * threaded));

        // 4. 紙模型が立ち上がる（回転しない。Y スケールだけ）
        const risen = ramp(p, 0.42, 0.7);
        blockMaterial.opacity = risen * 0.98;
        edgeMaterial.opacity = risen * 0.72;
        for (let i = 0; i < BLOCKS.length; i += 1) {
          const [x, z, w, d, h] = BLOCKS[i];
          // 街区ごとに少しずつ遅れて立つ。一斉に生えると街づくりゲームに見える
          const local = clamp01((risen - (i / BLOCKS.length) * 0.42) / 0.58);
          const eased = local * local * (3 - 2 * local);
          const y = Math.max(0.0001, h * eased);
          matrix.makeScale(w, y, d);
          matrix.setPosition(x, y / 2, z);
          blocks.setMatrixAt(i, matrix);
          const clone = edgeClones[i];
          if (clone) {
            clone.scale.set(w, y, d);
            clone.position.set(x, y / 2, z);
          }
        }
        blocks.instanceMatrix.needsUpdate = true;

        // 5. 地点が順番に灯る
        const lit = ramp(p, 0.62, 0.84);
        for (let i = 0; i < markMaterials.length; i += 1) {
          markMaterials[i].opacity =
            clamp01((lit - (i / markMaterials.length) * 0.7) / 0.3) * 0.9;
        }

        // 6. カメラは寄るだけ。回り込みも飛行もしない。
        //    街全体が常に一つの構図として収まる範囲でしか動かさない。
        const approach = clamp01(p);
        // 机の上に広げた地図を見下ろす角度（水平から約 57 度）。
        // これより浅いと手前の街区だけが画面を埋め、街が一つの構図に見えない。
        // 進行してもわずかに寄るだけで、全体は常に版面に収まる。
        // カメラは寄るだけ。回り込みも飛行もしない。
        //
        // 横長（PC）と縦長（スマートフォン）で構図の編集を変える。
        // 縦長のまま横長の画角を使うと、紙の左右が切れて「街」に見えない。
        //   横長: 机の上の地図を斜め上から見る。街全体が一望できる
        //   縦長: より真上へ寄せ、引きを強める。縦に街を読み下していける
        // 進行そのもの（紙→道→糸→建物→地点）は両方で同じ。
        const aspect = camera.aspect;
        const portrait = aspect < 1;
        const pull = portrait
          ? Math.min(1.78, 1.05 / Math.max(0.42, aspect))
          : Math.min(1.15, 1.45 / aspect);
        const height = (portrait ? 24 : 21) * pull - approach * 1.6;
        const depth = (portrait ? 9 : 13.5) * pull - approach * 1.2;
        camera.position.set(
          Math.sin(approach * 0.4) * 0.5,
          height,
          depth,
        );
        camera.lookAt(0, 0, approach * 0.2);

        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.density = 0.03 - approach * 0.014;
        }

        if (!running) render();

        if (process.env.NODE_ENV !== "production") {
          (window as unknown as Record<string, unknown>).__silkCity = {
            tier,
            progress: p,
            paperOpacity: groundMaterial.opacity,
            roadDrawn: roadGeometry.drawRange.count,
            roadVertexCount,
            threadDrawn: threadGeometry.drawRange.count,
            threadIndexCount,
            blockOpacity: blockMaterial.opacity,
            litMarks: markMaterials.filter((m) => m.opacity > 0.05).length,
            cameraY: camera.position.y,
            canvasPresent: true,
          };
        }
      };

      const trigger = ScrollTrigger.create({
        // 進行の基準はセクション全体。sticky の内側ではない
        trigger: host.closest("section") ?? host.parentElement ?? host,
        start: "top bottom",
        // sticky が解ける瞬間（セクション下端がビューポート下端に届く時）で
        // 進行を締める。そこから先は canvas が画面から外れるため、
        // "bottom top" にすると街が完成しないまま消える。
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self: { progress: number }) => apply(self.progress),
      });

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

      apply(0);
      ScrollTrigger.refresh();

      cleanup = () => {
        stop();
        trigger.kill();
        io.disconnect();
        resizeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        canvas.removeEventListener("webglcontextlost", onLost as EventListener);
        canvas.removeEventListener("webglcontextrestored", onRestored);

        groundGeometry.dispose();
        groundMaterial.dispose();
        shadowGeometry.dispose();
        shadowMaterial.dispose();
        paperTexture.dispose();
        roadGeometry.dispose();
        roadMaterial.dispose();
        blockGeometry.dispose();
        blockMaterial.dispose();
        blocks.dispose();
        edgeGeometry.dispose();
        edgeMaterial.dispose();
        edges.geometry.dispose();
        threadGeometry.dispose();
        threadMaterial.dispose();
        markGeometry.dispose();
        for (const m of markMaterials) m.dispose();
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

  return (
    <div className={styles.host} aria-hidden="true">
      <div ref={hostRef} className={styles.viewport} />
    </div>
  );
}
