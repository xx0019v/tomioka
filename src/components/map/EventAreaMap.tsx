"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { GuideCharacter, type GuideState } from "@/components/guide/GuideCharacter";
import type { GuideExpression } from "@/components/guide/SilkwormMascot";
import type { EventSpot } from "@/data/spots";
import { AnalyticsEvent, trackEvent } from "@/lib/analytics";
import { withBasePath } from "@/lib/base-path";
import { NEAR_THRESHOLD_METERS, distanceInMeters } from "@/lib/geo";
import styles from "./EventAreaMap.module.css";

type GeoState = "idle" | "locating" | "granted" | "denied" | "unavailable";
type SelectionPhase = "idle" | "thread" | "gaze" | "sheet";

interface EventAreaMapProps {
  spots: EventSpot[];
}

export function EventAreaMap({ spots }: EventAreaMapProps) {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapStageRef = useRef<HTMLDivElement>(null);
  const sidePanelRef = useRef<HTMLElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef(new Map<string, LeafletMarker>());
  const userMarkerRef = useRef<LeafletMarker | null>(null);
  const listButtonsRef = useRef(new Map<string, HTMLButtonElement>());
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<{ slug: string; source: "marker" | "list" } | null>(null);
  const pendingFocusRef = useRef<{ slug: string; source: "marker" | "list" } | null>(null);
  const locatingRef = useRef(false);
  const selectionTimersRef = useRef<number[]>([]);
  const hasSyncedUrlRef = useRef(false);
  const mobileMapRef = useRef(false);
  const sheetDragRef = useRef<{
    pointerId: number;
    startY: number;
    lastY: number;
    lastTime: number;
    velocity: number;
  } | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectionPhase, setSelectionPhase] = useState<SelectionPhase>("idle");
  const [selectionGaze, setSelectionGaze] = useState<"looking-left" | "looking-right">("looking-left");
  const [mapState, setMapState] = useState<"loading" | "ready" | "limited" | "failed">("loading");
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [mapInteractionEnabled, setMapInteractionEnabled] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const selected = spots.find((spot) => spot.slug === selectedSlug) ?? null;

  /**
   * きぬの案内は地図の状態に追従する。
   * 現在地の取得状況を最優先し、次に選択中のスポット、最後に地図の操作状態を見る。
   * 攻略順・ヒント・答えには触れない。
   */
  const guide: { lines: readonly [string, string?]; expression: GuideExpression; state: GuideState } =
    !mapVisible
      ? { lines: ["地図のそばで", "静かに待っているよ"], expression: "neutral", state: "resting" }
      : geoState === "locating"
      ? { lines: ["現在地を探しているよ", "少しだけ待ってね"], expression: "thinking", state: "locating" }
      : geoState === "granted"
        ? { lines: ["現在地が出たよ", "近い場所から歩けるね"], expression: "pleased", state: "success" }
        : geoState === "denied" || geoState === "unavailable"
          ? { lines: ["現在地は使えないけれど", "スポット一覧から選べるよ"], expression: "concerned", state: "soft-warning" }
          : selected
            ? selectionPhase === "thread"
              ? { lines: ["絹糸をたどって", `${selected.name}へ`], expression: "pointing", state: "guiding" }
              : selectionPhase === "gaze"
                ? { lines: [`${selected.name}は`, "この先にあるよ"], expression: "pointing", state: selectionGaze }
                : { lines: [`${selected.name}を選んだね`, "場所と行き方を見てみよう"], expression: "pointing", state: "guiding" }
            : mapInteractionEnabled
              ? { lines: ["地図を動かせるよ", "終わったら操作を終了してね"], expression: "map-reading", state: "guiding" }
              : mapState === "loading"
                ? { lines: ["地図をひらいているよ", "少しだけ待ってね"], expression: "thinking", state: "thinking" }
                : { lines: ["地図の印を選ぶと", "場所と目印がわかるよ"], expression: "map-reading", state: "breathing" };

  const focusTrigger = useCallback((slug: string, source: "marker" | "list") => {
    window.requestAnimationFrame(() => {
      const markerElement = markersRef.current.get(slug)?.getElement();
      const listButton = listButtonsRef.current.get(slug);
      if (source === "list" && listButton) {
        listButton.focus();
        return;
      }
      if (markerElement) {
        markerElement.focus();
        return;
      }
      listButton?.focus();
    });
  }, []);

  const syncSelectionFromUrl = useCallback(() => {
    selectionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    selectionTimersRef.current = [];
    const slug = new URL(window.location.href).searchParams.get("spot");
    const spot = spots.find((item) => item.slug === slug);
    setSelectedSlug(spot?.slug ?? null);
    setSelectionPhase(spot ? "sheet" : "idle");
    if (spot) setAnnouncement(`${spot.name}の案内を開きました。`);
    else if (hasSyncedUrlRef.current) setAnnouncement("スポット案内を閉じました。");
    hasSyncedUrlRef.current = true;
  }, [spots]);

  const clearSelectionFlow = useCallback(() => {
    selectionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    selectionTimersRef.current = [];
  }, []);

  const pointThreadAtMarker = useCallback((slug: string) => {
    const stage = mapStageRef.current;
    const marker = markersRef.current.get(slug)?.getElement();
    if (!stage || !marker) return;
    const stageRect = stage.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const startX = markerRect.left + markerRect.width / 2 - stageRect.left;
    const startY = markerRect.top + markerRect.height / 2 - stageRect.top;
    const targetX = Math.max(36, stageRect.width - 46);
    const targetY = 62;
    const dx = targetX - startX;
    const dy = targetY - startY;
    stage.style.setProperty("--selection-thread-x", `${startX}px`);
    stage.style.setProperty("--selection-thread-y", `${startY}px`);
    stage.style.setProperty("--selection-thread-length", `${Math.hypot(dx, dy)}px`);
    stage.style.setProperty("--selection-thread-angle", `${Math.atan2(dy, dx)}rad`);
    setSelectionGaze(dx < 0 ? "looking-left" : "looking-right");
  }, []);

  const beginSelectionFlow = useCallback((slug: string) => {
    clearSelectionFlow();
    setSelectionPhase("thread");
    window.requestAnimationFrame(() => pointThreadAtMarker(slug));
    selectionTimersRef.current = [
      window.setTimeout(() => setSelectionPhase("gaze"), 180),
      window.setTimeout(() => setSelectionPhase("sheet"), 380),
    ];
  }, [clearSelectionFlow, pointThreadAtMarker]);

  useEffect(() => clearSelectionFlow, [clearSelectionFlow]);

  useEffect(() => {
    const initialSync = window.setTimeout(syncSelectionFromUrl, 0);
    window.addEventListener("popstate", syncSelectionFromUrl);
    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener("popstate", syncSelectionFromUrl);
    };
  }, [syncSelectionFromUrl]);

  useEffect(() => {
    const stage = mapStageRef.current;
    if (!stage) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intersecting = false;

    const updateVisible = () => {
      setMapVisible(!motionQuery.matches && !document.hidden && intersecting);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = Boolean(entry?.isIntersecting);
        updateVisible();
      },
      { rootMargin: "10% 0px", threshold: 0.01 },
    );
    observer.observe(stage);
    motionQuery.addEventListener("change", updateVisible);
    document.addEventListener("visibilitychange", updateVisible);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", updateVisible);
      document.removeEventListener("visibilitychange", updateVisible);
    };
  }, []);

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;
    let disposed = false;
    let tileErrors = 0;
    const loadTimeout = window.setTimeout(() => {
      if (!disposed) setMapState((current) => current === "loading" ? "limited" : current);
    }, 3500);
    const markerStore = markersRef.current;

    trackEvent(AnalyticsEvent.MapView, { spot_count: spots.length });

    void import("leaflet")
      .then((L) => {
        if (disposed || !mapNodeRef.current) return;
        leafletRef.current = L;
        const mobileMap = window.matchMedia("(max-width: 899px) and (pointer: coarse)").matches;
        mobileMapRef.current = mobileMap;
        setMapInteractionEnabled(!mobileMap);
        const map = L.map(mapNodeRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
          dragging: !mobileMap,
          touchZoom: !mobileMap,
          doubleClickZoom: !mobileMap,
          boxZoom: !mobileMap,
          keyboard: !mobileMap,
        });
        mapRef.current = map;

        const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        });
        tiles.on("tileerror", () => {
          tileErrors += 1;
          if (tileErrors >= 4) setMapState("limited");
        });
        tiles.on("load", () => {
          window.clearTimeout(loadTimeout);
          setMapState(tileErrors >= 4 ? "limited" : "ready");
        });
        tiles.addTo(map);

        const bounds = L.latLngBounds([]);
        spots.forEach((spot) => {
          const roleClass = spot.category === "start" ? " map-marker--start" : spot.category === "rest" ? " map-marker--annex" : "";
          const marker = L.marker([spot.latitude, spot.longitude], {
            keyboard: true,
            interactive: true,
            title: `${spot.categoryLabel} ${spot.name}`,
            alt: `${spot.name}の案内を開く`,
            icon: L.divIcon({
              className: "map-marker-shell",
              html: `<span class="map-marker${roleClass}"><span class="map-marker-glyph" aria-hidden="true">${spot.marker}</span></span>`,
              iconSize: [56, 62],
              iconAnchor: [28, 62],
            }),
          });
          marker.on("click", () => openSpot(spot.slug, "marker"));
          marker.on("add", () => {
            const element = marker.getElement();
            element?.setAttribute("aria-label", `${spot.name}の案内を開く`);
            element?.setAttribute("data-latitude", String(spot.latitude));
            element?.setAttribute("data-longitude", String(spot.longitude));
          });
          marker.bindTooltip(spot.name, { direction: "top", offset: [0, -51] });
          marker.addTo(map);
          markerStore.set(spot.slug, marker);
          bounds.extend([spot.latitude, spot.longitude]);
        });
        map.fitBounds(bounds, { padding: [42, 42], maxZoom: 17 });
        window.setTimeout(() => map.invalidateSize(), 0);

        const syncMapSize = () => {
          window.requestAnimationFrame(() => map.invalidateSize({ pan: false }));
        };
        const syncOrientation = () => {
          syncMapSize();
          if (!mobileMap) return;
          [
            map.dragging,
            map.touchZoom,
            map.doubleClickZoom,
            map.boxZoom,
            map.keyboard,
          ].forEach((handler) => handler.disable());
          setMapInteractionEnabled(false);
          setAnnouncement("画面の向きが変わりました。地図は表示モードに戻りました。");
        };
        window.addEventListener("resize", syncMapSize, { passive: true });
        window.addEventListener("orientationchange", syncOrientation);
        map.once("unload", () => {
          window.removeEventListener("resize", syncMapSize);
          window.removeEventListener("orientationchange", syncOrientation);
        });
      })
      .catch(() => setMapState("failed"));

    return () => {
      disposed = true;
      window.clearTimeout(loadTimeout);
      mapRef.current?.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      leafletRef.current = null;
      markerStore.clear();
    };
    // The spot dataset is static for the lifetime of this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    markersRef.current.forEach((marker, slug) => {
      marker.getElement()?.classList.toggle("map-marker-shell--selected", slug === selectedSlug);
    });
  }, [selectedSlug]);

  useEffect(() => {
    if (!selectedSlug || selectionPhase !== "gaze") return;
    const marker = markersRef.current.get(selectedSlug);
    if (marker && mapRef.current) {
      const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      mapRef.current.panInside(marker.getLatLng(), {
        paddingTopLeft: [72, 92],
        paddingBottomRight: [72, 120],
        animate,
        duration: animate ? 0.32 : 0,
      });
    }
  }, [selectedSlug, selectionPhase]);

  useEffect(() => {
    if (!selectedSlug || selectionPhase !== "sheet") return;
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
  }, [selectedSlug, selectionPhase]);

  useEffect(() => {
    if (selectedSlug || !pendingFocusRef.current) return;
    const trigger = pendingFocusRef.current;
    pendingFocusRef.current = null;
    focusTrigger(trigger.slug, trigger.source);
  }, [focusTrigger, selectedSlug]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedSlug) closeSpot();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  function setMapInteraction(enabled: boolean) {
    const map = mapRef.current;
    if (!map || !mobileMapRef.current) return;
    const handlers = [
      map.dragging,
      map.touchZoom,
      map.doubleClickZoom,
      map.boxZoom,
      map.keyboard,
    ];
    handlers.forEach((handler) => enabled ? handler.enable() : handler.disable());
    setMapInteractionEnabled(enabled);
    setAnnouncement(
      enabled
        ? "地図操作を開始しました。指で移動や拡大縮小ができます。"
        : "地図操作を終了しました。ページを縦にスクロールできます。",
    );
  }

  function onSheetPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const panel = sidePanelRef.current;
    if (!panel) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const now = performance.now();
    sheetDragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: now,
      velocity: 0,
    };
    panel.dataset.dragging = "true";
  }

  function onSheetPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = sheetDragRef.current;
    const panel = sidePanelRef.current;
    if (!drag || !panel || drag.pointerId !== event.pointerId) return;
    const nextY = Math.max(event.clientY, drag.startY);
    const now = performance.now();
    const elapsed = Math.max(now - drag.lastTime, 1);
    drag.velocity = (nextY - drag.lastY) / elapsed;
    drag.lastY = nextY;
    drag.lastTime = now;
    panel.style.transform = `translate3d(0, ${nextY - drag.startY}px, 0)`;
  }

  function finishSheetDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = sheetDragRef.current;
    const panel = sidePanelRef.current;
    if (!drag || !panel || drag.pointerId !== event.pointerId) return;
    sheetDragRef.current = null;
    const distance = Math.max(0, event.clientY - drag.startY);
    const shouldClose = distance > 92 || drag.velocity > 0.58;
    delete panel.dataset.dragging;
    if (!shouldClose) {
      panel.style.transform = "";
      return;
    }
    panel.dataset.dismissing = "true";
    panel.style.transform = "translate3d(0, 110%, 0)";
    window.setTimeout(() => {
      closeSpot();
      window.setTimeout(() => {
        panel.style.transform = "";
        delete panel.dataset.dismissing;
      }, 80);
    }, 220);
  }

  function openSpot(slug: string, source: "marker" | "list") {
    if (new URL(window.location.href).searchParams.get("spot") === slug) return;
    clearSelectionFlow();
    lastTriggerRef.current = { slug, source };
    const url = new URL(window.location.href);
    url.searchParams.set("spot", slug);
    window.history.pushState({ ...window.history.state, mayuMapPanel: true, source }, "", url);
    setSelectedSlug(slug);
    beginSelectionFlow(slug);
    const spot = spots.find((item) => item.slug === slug);
    if (spot) setAnnouncement(`${spot.name}の案内を開きました。`);
    trackEvent(AnalyticsEvent.SpotSelect, { spot: slug, source });
  }

  function markNearest(userLat: number, userLng: number) {
    let nearestSlug: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    spots.forEach((spot) => {
      const distance = distanceInMeters(
        { lat: userLat, lng: userLng },
        { lat: spot.latitude, lng: spot.longitude },
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestSlug = spot.slug;
      }
    });
    markersRef.current.forEach((marker, slug) => {
      const inner = marker.getElement()?.querySelector(".map-marker");
      if (!inner) return;
      const isNear = slug === nearestSlug && nearestDistance <= NEAR_THRESHOLD_METERS;
      inner.classList.toggle("map-marker--near", isNear);
    });
    if (nearestSlug && nearestDistance <= NEAR_THRESHOLD_METERS) {
      const near = spots.find((item) => item.slug === nearestSlug);
      if (near) setAnnouncement(`現在地に最も近いスポットは${near.name}です。`);
    }
  }

  function locate() {
    if (locatingRef.current) return;
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    locatingRef.current = true;
    trackEvent(AnalyticsEvent.LocateClick, {});
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      locatingRef.current = false;
      setGeoState("unavailable");
      setAnnouncement("この端末では現在地を取得できません。スポット一覧をご利用ください。");
      trackEvent(AnalyticsEvent.GeoPermission, { result: "unavailable" });
      return;
    }
    setGeoState("locating");
    setAnnouncement("現在地を取得しています。");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locatingRef.current = false;
        const { latitude, longitude } = position.coords;
        setGeoState("granted");
        trackEvent(AnalyticsEvent.GeoPermission, { result: "granted" });
        const latlng: [number, number] = [latitude, longitude];
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(latlng);
        } else {
          userMarkerRef.current = L.marker(latlng, {
            keyboard: false,
            interactive: false,
            icon: L.divIcon({
              className: "map-user-shell",
              html: '<span class="map-user-dot" aria-hidden="true"></span>',
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            }),
          }).addTo(map);
          userMarkerRef.current.getElement()?.setAttribute("aria-hidden", "true");
        }
        const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        map.panTo(latlng, { animate, duration: animate ? 0.45 : 0 });
        markNearest(latitude, longitude);
      },
      (error) => {
        locatingRef.current = false;
        const denied = error.code === error.PERMISSION_DENIED;
        setGeoState(denied ? "denied" : "unavailable");
        setAnnouncement(
          denied
            ? "現在地の利用が許可されませんでした。スポット一覧から選べます。"
            : "現在地を取得できませんでした。スポット一覧から選べます。",
        );
        trackEvent(AnalyticsEvent.GeoPermission, {
          result: denied ? "denied" : "unavailable",
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  }

  function closeSpot() {
    if (!selectedSlug) return;
    clearSelectionFlow();
    setSelectionPhase("idle");
    const triggerToFocus = lastTriggerRef.current ?? { slug: selectedSlug, source: "marker" as const };
    pendingFocusRef.current = triggerToFocus;
    if (window.history.state?.mayuMapPanel) {
      window.history.back();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete("spot");
      window.history.replaceState(window.history.state, "", url);
      setSelectedSlug(null);
      setAnnouncement("スポット案内を閉じました。");
    }
  }

  const detailVisible = selected && selectionPhase === "sheet" ? selected : null;

  return (
    <section className={styles.section} aria-labelledby="map-heading">
      <div className={styles.headingRow}>
        <p className={styles.folio} aria-hidden="true">MAP / 01</p>
        <div>
          <p className={styles.eyebrow}>EVENT AREA / TOMIOKA</p>
          <h2 id="map-heading"><span>絹糸が結ぶ</span><span>富岡の街</span></h2>
        </div>
        <p>記号か街歩きスポット一覧を選ぶと、場所の特徴とアクセス情報を確認できます。</p>
      </div>

      <div className={styles.mapShell}>
        <div
          ref={mapStageRef}
          className={styles.mapStage}
          data-map-visible={mapVisible}
          data-map-interaction={mapInteractionEnabled ? "active" : "view"}
        >
          <Image
            className={styles.mapFallback}
            src={withBasePath("/images/route-thread.webp")}
            alt=""
            fill
            sizes="(max-width: 899px) 100vw, 70vw"
            aria-hidden="true"
          />
          <div
            ref={mapNodeRef}
            className={styles.map}
            role="region"
            aria-label="富岡のイベントエリアと街歩きスポットの地図"
          />
          <span
            className={styles.selectionThread}
            data-phase={selectionPhase}
            aria-hidden="true"
          />
          {mapState === "loading" && <p className={styles.mapMessage}>地図資料を展開しています…</p>}
          {(mapState === "limited" || mapState === "failed") && (
            <div className={styles.mapMessage} role="status">
              <strong>地図画像を十分に読み込めませんでした。</strong>
              <span>スポット一覧とGoogleマップのリンクは引き続き利用できます。</span>
            </div>
          )}
          <button
            type="button"
            className={styles.interactionButton}
            onClick={() => setMapInteraction(!mapInteractionEnabled)}
            aria-pressed={mapInteractionEnabled}
            disabled={mapState === "loading"}
          >
            <span aria-hidden="true">{mapInteractionEnabled ? "↕" : "＋"}</span>
            {mapInteractionEnabled ? "操作を終了" : "地図を操作"}
          </button>
          <div className={styles.legend} aria-label="地図記号の説明">
            <span><i className={styles.startKey} />受付・案内</span>
            <span><i className={styles.pointKey} />街歩きスポット</span>
            <span><i className={styles.annexKey} />休憩地点</span>
          </div>
          <div className={styles.locateWrap}>
            <button
              type="button"
              className={styles.locateButton}
              onClick={locate}
              disabled={geoState === "locating"}
              aria-label="現在地を地図に表示する"
            >
              <span aria-hidden="true">◎</span>
              {geoState === "locating" ? "取得中…" : "現在地を表示"}
            </button>
            {(geoState === "denied" || geoState === "unavailable") && (
              <p className={styles.locateHint} role="status">
                現在地を利用できません。スポット一覧から選べます。
              </p>
            )}
          </div>
        </div>

        <aside
          ref={sidePanelRef}
          className={`${styles.sidePanel} ${detailVisible ? styles.sidePanelOpen : ""}`}
          aria-label={detailVisible ? `${detailVisible.name}のスポット案内` : "街歩きスポット一覧"}
        >
          {detailVisible ? (
            <article className={styles.detail}>
              <div
                className={styles.sheetHandle}
                onPointerDown={onSheetPointerDown}
                onPointerMove={onSheetPointerMove}
                onPointerUp={finishSheetDrag}
                onPointerCancel={finishSheetDrag}
                aria-hidden="true"
              >
                <span />
              </div>
              <div className={styles.detailTopline}>
                <span className={styles.recordNumber}>{detailVisible.marker}</span>
                <button ref={closeButtonRef} type="button" className={styles.closeButton} onClick={closeSpot} aria-label={`${detailVisible.name}の案内を閉じる`}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className={styles.detailVisual}>
                <Image src={detailVisible.visualSrc} alt={detailVisible.visualAlt} fill sizes="(max-width: 899px) 100vw, 390px" />
              </div>
              <p className={styles.photoCredit}>
                <a href={detailVisible.visualSourceUrl} target="_blank" rel="noopener noreferrer">
                  {detailVisible.visualCredit}
                </a>
              </p>
              <p className={styles.detailKicker}>{detailVisible.categoryLabel} / TOMIOKA</p>
              <h3>{detailVisible.formalName ?? detailVisible.name}</h3>
              <p className={styles.description}>{detailVisible.description}</p>

              <dl className={styles.facts}>
                <div><dt>所在地</dt><dd>{detailVisible.address}</dd></div>
                <div><dt>位置の目安</dt><dd>{detailVisible.relation}</dd></div>
              </dl>

              <div className={styles.actions}>
                <a
                  href={detailVisible.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(AnalyticsEvent.GoogleMapsClick, { spot: detailVisible.slug })}
                >
                  Googleマップで開く
                </a>
              </div>
            </article>
          ) : (
            <div className={styles.indexPanel}>
              <p className={styles.indexLabel}>SPOT INDEX</p>
              <h3>街歩きスポット</h3>
              <ul>
                {spots.map((spot) => (
                  <li key={spot.id}>
                    <button
                      ref={(node) => {
                        if (node) listButtonsRef.current.set(spot.slug, node);
                        else listButtonsRef.current.delete(spot.slug);
                      }}
                      type="button"
                      onClick={() => openSpot(spot.slug, "list")}
                    >
                      <span>{spot.marker}</span>
                      <span><strong>{spot.name}</strong><small>{spot.categoryLabel}</small></span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className={styles.indexNote}>受付地点、富岡製糸場周辺の街並み、休憩場所を一枚の地図で確認できます。</p>
            </div>
          )}
        </aside>
        <GuideCharacter
          placement="map-stage"
          lines={guide.lines}
          expression={guide.expression}
          state={guide.state}
          initiallyOpen={false}
        />
      </div>
      <p className="visually-hidden" aria-live="polite">{announcement}</p>
    </section>
  );
}
