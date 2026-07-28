"use client";

import { useEffect, useRef, useState } from "react";
import type {
  BufferGeometry,
  Group,
  Material,
  Mesh,
  Object3D,
  Scene,
  Texture,
} from "three";
import styles from "./SpatialRouteCanvas.module.css";

export interface SpatialPoint {
  id: string;
  slug: string;
  shortName: string;
  name: string;
  latitude: number;
  longitude: number;
  role: "start-goal" | "checkpoint" | "solve-annex";
}

interface SpatialRouteCanvasProps {
  points: SpatialPoint[];
  activeSlug: string;
  discoveredIds: string[];
  onSelect: (slug: string) => void;
}

type RenderState = "fallback" | "loading" | "ready" | "unsupported" | "context_lost" | "failed";
type EnhancementMode = "auto" | "on" | "off";

interface NetworkInformationLike extends EventTarget {
  saveData?: boolean;
  effectiveType?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformationLike;
}

interface CapabilitySignals {
  reducedMotion: boolean;
  constrainedNetwork: boolean;
}

interface MarkerParts {
  group: Group;
  stem: Mesh;
  head: Mesh;
  hitArea: Mesh;
  point: SpatialPoint;
}

export function SpatialRouteCanvas({ points, activeSlug, discoveredIds, onSelect }: SpatialRouteCanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeSlugRef = useRef(activeSlug);
  const discoveredRef = useRef(discoveredIds);
  const onSelectRef = useRef(onSelect);
  const focusSceneRef = useRef<((slug: string, animate: boolean) => void) | null>(null);
  const updateDiscoveryRef = useRef<((ids: string[]) => void) | null>(null);
  const contextLossCountRef = useRef(0);
  const [renderState, setRenderState] = useState<RenderState>("fallback");
  const [enhancementMode, setEnhancementMode] = useState<EnhancementMode>("auto");
  const [retryToken, setRetryToken] = useState(0);
  const [signals, setSignals] = useState<CapabilitySignals | null>(null);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as NavigatorWithConnection).connection;
    const readSignals = () => {
      const effectiveType = connection?.effectiveType;
      setSignals({
        reducedMotion: motionQuery.matches,
        constrainedNetwork: Boolean(
          connection?.saveData || effectiveType === "slow-2g" || effectiveType === "2g",
        ),
      });
    };

    readSignals();
    motionQuery.addEventListener("change", readSignals);
    connection?.addEventListener("change", readSignals);
    return () => {
      motionQuery.removeEventListener("change", readSignals);
      connection?.removeEventListener("change", readSignals);
    };
  }, []);

  useEffect(() => {
    activeSlugRef.current = activeSlug;
    focusSceneRef.current?.(activeSlug, !signals?.reducedMotion);
  }, [activeSlug, signals?.reducedMotion]);

  useEffect(() => {
    discoveredRef.current = discoveredIds;
    updateDiscoveryRef.current?.(discoveredIds);
  }, [discoveredIds]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || !signals || enhancementMode === "off") return;
    const capabilitySignals = signals;

    const constrained = capabilitySignals.reducedMotion || capabilitySignals.constrainedNetwork;
    if (enhancementMode === "auto" && constrained) return;

    let disposed = false;
    let initializing = false;
    let sceneReady = false;
    let sceneVisible = false;
    let cleanupScene: (() => void) | undefined;

    const startInitialization = () => {
      if (sceneReady) {
        focusSceneRef.current?.(activeSlugRef.current, false);
        return;
      }
      if (disposed || initializing) return;

      const probe = document.createElement("canvas");
      if (!probe.getContext("webgl2") && !probe.getContext("webgl")) {
        setRenderState("unsupported");
        return;
      }

      initializing = true;
      setRenderState("loading");
      void initializeScene().catch(() => {
        if (!disposed) setRenderState("failed");
      }).finally(() => {
        initializing = false;
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        sceneVisible = entry.isIntersecting;
        if (!sceneVisible) {
          focusSceneRef.current?.(activeSlugRef.current, false);
          return;
        }
        startInitialization();
      },
      { rootMargin: "260px" },
    );
    observer.observe(root);
    if (enhancementMode === "on") {
      sceneVisible = true;
      startInitialization();
    }

    async function initializeScene() {
      const THREE = await import("three");
      if (disposed || !canvas || !root) return;

      const lowProfile = window.innerWidth < 700 || capabilitySignals.constrainedNetwork;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !lowProfile,
        powerPreference: "low-power",
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowProfile ? 1.25 : 1.5));
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      const currentLookAt = new THREE.Vector3(0, 0, 0);
      camera.position.set(0, -7.6, 9.8);
      camera.lookAt(currentLookAt);

      const paper = new THREE.Mesh(
        new THREE.BoxGeometry(10.4, 6.7, 0.18, 1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0xd8ceb9, roughness: 0.96, metalness: 0 }),
      );
      paper.position.z = -0.18;
      scene.add(paper);

      const gridMaterial = new THREE.LineBasicMaterial({ color: 0x796f5c, transparent: true, opacity: 0.15 });
      for (let x = -4.5; x <= 4.5; x += 0.75) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, -2.8, -0.03),
          new THREE.Vector3(x, 2.8, -0.03),
        ]);
        scene.add(new THREE.Line(geometry, gridMaterial));
      }
      for (let y = -2.7; y <= 2.7; y += 0.75) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-4.7, y, -0.03),
          new THREE.Vector3(4.7, y, -0.03),
        ]);
        scene.add(new THREE.Line(geometry, gridMaterial));
      }

      scene.add(new THREE.HemisphereLight(0xf5ead1, 0x17372f, 2.1));
      const keyLight = new THREE.DirectionalLight(0xffe9b0, 3.2);
      keyLight.position.set(-3.5, -1.5, 7);
      scene.add(keyLight);

      const normalized = normalizePoints(points);
      const markerParts = new Map<string, MarkerParts>();
      const markerObjects: Object3D[] = [];
      const routePoints = normalized.map((point) => new THREE.Vector3(point.x, point.y, 0.3));
      if (routePoints.length > 1) {
        const routeCurve = new THREE.CatmullRomCurve3(routePoints, false, "centripetal", 0.3);
        const route = new THREE.Mesh(
          new THREE.TubeGeometry(routeCurve, 72, 0.025, 5, false),
          new THREE.MeshStandardMaterial({ color: 0xa33b2b, roughness: 0.7, metalness: 0.05 }),
        );
        route.name = "silk-thread";
        scene.add(route);
      }

      normalized.forEach((point) => {
        const group = new THREE.Group();
        group.userData.slug = point.slug;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.05, 0.72, 10),
          new THREE.MeshStandardMaterial({ color: 0x8f7037, roughness: 0.34, metalness: 0.72 }),
        );
        stem.rotation.x = Math.PI / 2;
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(point.role === "solve-annex" ? 0.15 : 0.18, 18, 12),
          new THREE.MeshStandardMaterial({
            color: point.role === "start-goal" ? 0xa33b2b : point.role === "solve-annex" ? 0x9b7a3f : 0x17372f,
            roughness: 0.42,
            metalness: 0.38,
          }),
        );
        const hitArea = new THREE.Mesh(
          new THREE.SphereGeometry(0.34, 12, 8),
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
          }),
        );
        head.userData.slug = point.slug;
        hitArea.userData.slug = point.slug;
        hitArea.position.z = 0.55;
        group.add(stem, head, hitArea);
        group.position.set(point.x, point.y, 0);
        scene.add(group);
        markerParts.set(point.slug, { group, stem, head, hitArea, point });
        markerObjects.push(hitArea);
      });

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let frame = 0;
      let transitionStart = 0;
      let fromPosition = camera.position.clone();
      let toPosition = camera.position.clone();
      let fromLookAt = currentLookAt.clone();
      let toLookAt = currentLookAt.clone();
      let currentSlug = activeSlugRef.current;
      let contextIsLost = false;
      let compactLayout = root.getBoundingClientRect().width < 700;
      let pointerDown: { id: number; x: number; y: number } | null = null;

      const canRender = () => (
        !disposed && !contextIsLost && sceneVisible && document.visibilityState === "visible"
      );
      const render = () => {
        if (canRender()) renderer.render(scene, camera);
      };
      const stopTransition = () => {
        window.cancelAnimationFrame(frame);
        frame = 0;
      };

      const resize = () => {
        if (disposed || contextIsLost) return;
        const bounds = root.getBoundingClientRect();
        compactLayout = bounds.width < 700;
        markerParts.forEach(({ hitArea }) => {
          hitArea.scale.setScalar(compactLayout ? 1.8 : 1);
        });
        renderer.setSize(Math.max(1, bounds.width), Math.max(1, bounds.height), false);
        camera.aspect = Math.max(1, bounds.width) / Math.max(1, bounds.height);
        camera.updateProjectionMatrix();
        render();
      };

      const animateFocus = (time: number) => {
        if (!canRender()) {
          stopTransition();
          camera.position.copy(toPosition);
          currentLookAt.copy(toLookAt);
          camera.lookAt(currentLookAt);
          return;
        }
        const progress = Math.min(1, (time - transitionStart) / 520);
        const eased = 1 - Math.pow(1 - progress, 3);
        camera.position.lerpVectors(fromPosition, toPosition, eased);
        currentLookAt.lerpVectors(fromLookAt, toLookAt, eased);
        camera.lookAt(currentLookAt);
        render();
        if (progress < 1) frame = window.requestAnimationFrame(animateFocus);
        else frame = 0;
      };

      const focus = (slug: string, animate: boolean) => {
        const target = markerParts.get(slug);
        if (!target) return;
        currentSlug = slug;
        markerParts.forEach(({ group }, markerSlug) => {
          group.scale.setScalar(markerSlug === slug ? 1.28 : 1);
        });
        stopTransition();
        fromPosition = camera.position.clone();
        fromLookAt = currentLookAt.clone();
        const depth = compactLayout ? 10.7 : 8.8;
        const distance = compactLayout ? -8.1 : -7.25;
        toPosition = new THREE.Vector3(target.group.position.x * 0.2, distance + target.group.position.y * 0.14, depth);
        toLookAt = new THREE.Vector3(target.group.position.x * 0.32, target.group.position.y * 0.28, 0);
        if (!animate || capabilitySignals.reducedMotion || !canRender()) {
          camera.position.copy(toPosition);
          currentLookAt.copy(toLookAt);
          camera.lookAt(currentLookAt);
          render();
          return;
        }
        transitionStart = performance.now();
        frame = window.requestAnimationFrame(animateFocus);
      };

      const updateDiscovery = (ids: string[]) => {
        const discovered = new Set(ids);
        markerParts.forEach(({ stem, head, point }) => {
          const isDiscovered = point.role === "start-goal" || discovered.has(point.id);
          stem.scale.y = isDiscovered ? 1 : 0.58;
          stem.position.z = isDiscovered ? 0.34 : 0.2;
          head.position.z = isDiscovered ? 0.72 : 0.42;
        });
        render();
      };

      const updatePointer = (event: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect();
        if (bounds.width <= 0 || bounds.height <= 0) return false;
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
        return true;
      };
      const handlePointerDown = (event: PointerEvent) => {
        pointerDown = { id: event.pointerId, x: event.clientX, y: event.clientY };
      };
      const handlePointerUp = (event: PointerEvent) => {
        if (!pointerDown || pointerDown.id !== event.pointerId) return;
        const travel = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
        pointerDown = null;
        if (travel > 8 || !updatePointer(event)) return;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(markerObjects, false)[0];
        const slug = hit?.object.userData.slug as string | undefined;
        if (slug) onSelectRef.current(slug);
      };
      const handlePointerCancel = () => {
        pointerDown = null;
      };

      const handleVisibility = () => {
        if (document.visibilityState === "hidden") {
          stopTransition();
          return;
        }
        focus(activeSlugRef.current, false);
      };
      const contextLost = (event: Event) => {
        event.preventDefault();
        contextIsLost = true;
        contextLossCountRef.current += 1;
        stopTransition();
        focusSceneRef.current = null;
        updateDiscoveryRef.current = null;
        setRenderState("context_lost");
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(root);
      canvas.addEventListener("pointerdown", handlePointerDown, { passive: true });
      canvas.addEventListener("pointerup", handlePointerUp, { passive: true });
      canvas.addEventListener("pointercancel", handlePointerCancel, { passive: true });
      canvas.addEventListener("webglcontextlost", contextLost);
      document.addEventListener("visibilitychange", handleVisibility);

      focusSceneRef.current = focus;
      updateDiscoveryRef.current = updateDiscovery;
      updateDiscovery(discoveredRef.current);
      resize();
      focus(currentSlug, false);
      sceneReady = true;
      setRenderState("ready");

      cleanupScene = () => {
        sceneReady = false;
        stopTransition();
        resizeObserver.disconnect();
        canvas.removeEventListener("pointerdown", handlePointerDown);
        canvas.removeEventListener("pointerup", handlePointerUp);
        canvas.removeEventListener("pointercancel", handlePointerCancel);
        canvas.removeEventListener("webglcontextlost", contextLost);
        document.removeEventListener("visibilitychange", handleVisibility);
        if (focusSceneRef.current === focus) focusSceneRef.current = null;
        if (updateDiscoveryRef.current === updateDiscovery) updateDiscoveryRef.current = null;
        disposeScene(scene);
        renderer.renderLists.dispose();
        renderer.dispose();
        if (!contextIsLost) renderer.forceContextLoss();
      };
    }

    return () => {
      disposed = true;
      observer.disconnect();
      cleanupScene?.();
    };
  }, [enhancementMode, points, retryToken, signals]);

  function toggleEnhancement() {
    if (renderState === "loading") return;
    if (renderState === "ready") {
      setEnhancementMode("off");
      setRenderState("fallback");
      return;
    }
    if (enhancementMode === "on") {
      setRetryToken((current) => current + 1);
      setRenderState("fallback");
      return;
    }
    setEnhancementMode("on");
    setRenderState("fallback");
  }

  const statusMessage = getStatusMessage(renderState, enhancementMode, signals);

  return (
    <div ref={rootRef} className={`${styles.root} ${renderState === "ready" ? styles.ready : ""}`}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.controlRow}>
        <span aria-live="polite">{statusMessage}</span>
        <button
          type="button"
          onClick={toggleEnhancement}
          disabled={renderState === "loading"}
          aria-pressed={renderState === "ready"}
        >
          {renderState === "ready" || renderState === "loading" ? "立体表示を切る" : renderState === "failed" || renderState === "context_lost" || renderState === "unsupported" ? "立体表示を再試行" : "立体表示を試す"}
        </button>
      </div>
    </div>
  );
}

function getStatusMessage(
  renderState: RenderState,
  enhancementMode: EnhancementMode,
  signals: CapabilitySignals | null,
) {
  if (renderState === "loading") return "立体調査図を読み込んでいます";
  if (renderState === "ready") return "立体調査図を表示中";
  if (renderState === "unsupported") return "WebGL非対応のため、二次元の調査図を表示しています";
  if (renderState === "context_lost") return "立体表示が停止したため、二次元の調査図を表示しています";
  if (renderState === "failed") return "立体表示を利用できないため、二次元の調査図を表示しています";
  if (enhancementMode === "off") return "二次元の調査図を表示中";
  if (signals?.reducedMotion) return "動きの設定に合わせ、二次元の調査図を表示しています";
  if (signals?.constrainedNetwork) return "通信量を抑えるため、二次元の調査図を表示しています";
  return "二次元の調査図を表示中";
}

function normalizePoints(points: SpatialPoint[]) {
  if (points.length === 0) return [];
  const centerLat = points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
  const centerLng = points.reduce((sum, point) => sum + point.longitude, 0) / points.length;
  const longitudeScale = Math.cos((centerLat * Math.PI) / 180);
  const projected = points.map((point) => ({
    ...point,
    projectedX: (point.longitude - centerLng) * longitudeScale,
    projectedY: point.latitude - centerLat,
  }));
  const minX = Math.min(...projected.map((point) => point.projectedX));
  const maxX = Math.max(...projected.map((point) => point.projectedX));
  const minY = Math.min(...projected.map((point) => point.projectedY));
  const maxY = Math.max(...projected.map((point) => point.projectedY));
  const scale = Math.min(
    7.7 / Math.max(maxX - minX, 0.000001),
    4.6 / Math.max(maxY - minY, 0.000001),
  );
  return projected.map((point) => ({
    ...point,
    x: point.projectedX * scale,
    y: point.projectedY * scale,
  }));
}

function disposeScene(scene: Scene) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  scene.traverse((object) => {
    const renderable = object as Object3D & { geometry?: BufferGeometry; material?: Material | Material[] };
    if (renderable.geometry) geometries.add(renderable.geometry);
    const objectMaterials = Array.isArray(renderable.material)
      ? renderable.material
      : renderable.material
        ? [renderable.material]
        : [];
    objectMaterials.forEach((material) => {
      materials.add(material);
      Object.values(material).forEach((value) => {
        if (value && typeof value === "object" && "isTexture" in value) textures.add(value as Texture);
      });
    });
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
  scene.clear();
}
