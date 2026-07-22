"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { Checkpoint, CheckpointSourceStatus } from "@/data/checkpoints";
import styles from "./CheckpointMap.module.css";

interface CheckpointMapProps {
  checkpoints: Checkpoint[];
}

const statusCopy: Record<CheckpointSourceStatus, { label: string; detail: string }> = {
  confirmed: { label: "確認済み", detail: "公開情報と所在地を確認済みです。" },
  needs_review: { label: "当日情報を確認中", detail: "所在地は公開住所をもとに表示しています。当日の案内を優先してください。" },
  pending: { label: "情報準備中", detail: "運営確認後に更新します。" },
};

export function CheckpointMap({ checkpoints }: CheckpointMapProps) {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef(new Map<string, LeafletMarker>());
  const listButtonsRef = useRef(new Map<string, HTMLButtonElement>());
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "limited" | "failed">("loading");
  const selected = checkpoints.find((checkpoint) => checkpoint.slug === selectedSlug) ?? null;

  const focusTrigger = useCallback((slug: string) => {
    window.requestAnimationFrame(() => {
      const markerElement = markersRef.current.get(slug)?.getElement();
      if (markerElement) {
        markerElement.focus();
        return;
      }
      listButtonsRef.current.get(slug)?.focus();
    });
  }, []);

  const syncSelectionFromUrl = useCallback(() => {
    const slug = new URL(window.location.href).searchParams.get("checkpoint");
    setSelectedSlug(checkpoints.some((checkpoint) => checkpoint.slug === slug) ? slug : null);
  }, [checkpoints]);

  useEffect(() => {
    const initialSync = window.setTimeout(syncSelectionFromUrl, 0);
    window.addEventListener("popstate", syncSelectionFromUrl);
    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener("popstate", syncSelectionFromUrl);
    };
  }, [syncSelectionFromUrl]);

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;
    let disposed = false;
    let tileErrors = 0;
    const markerStore = markersRef.current;

    void import("leaflet")
      .then((L) => {
        if (disposed || !mapNodeRef.current) return;
        const map = L.map(mapNodeRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
          keyboard: true,
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
        tiles.on("load", () => setMapState("ready"));
        tiles.addTo(map);

        const bounds = L.latLngBounds([]);
        checkpoints.forEach((checkpoint) => {
          const roleClass = checkpoint.role === "start-goal" ? " map-marker--start" : checkpoint.role === "solve-annex" ? " map-marker--annex" : "";
          const marker = L.marker([checkpoint.latitude, checkpoint.longitude], {
            keyboard: true,
            title: `${checkpoint.shortName} ${checkpoint.name}`,
            alt: `${checkpoint.shortName} ${checkpoint.name}の地点を開く`,
            icon: L.divIcon({
              className: "map-marker-shell",
              html: `<span class="map-marker${roleClass}"><span>${checkpoint.shortName}</span></span>`,
              iconSize: [48, 48],
              iconAnchor: [24, 24],
            }),
          });
          marker.on("click", () => openCheckpoint(checkpoint.slug, "marker"));
          marker.on("add", () => {
            marker.getElement()?.setAttribute("aria-label", `${checkpoint.shortName} ${checkpoint.name}の地点詳細を開く`);
          });
          marker.bindTooltip(checkpoint.name, { direction: "top", offset: [0, -20] });
          marker.addTo(map);
          markerStore.set(checkpoint.slug, marker);
          bounds.extend([checkpoint.latitude, checkpoint.longitude]);
        });
        map.fitBounds(bounds, { padding: [42, 42], maxZoom: 17 });
        window.setTimeout(() => map.invalidateSize(), 0);
      })
      .catch(() => setMapState("failed"));

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerStore.clear();
    };
    // The checkpoint dataset is static for the lifetime of this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    const marker = markersRef.current.get(selectedSlug);
    if (marker && mapRef.current) {
      mapRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.45 });
    }
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
  }, [selectedSlug]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedSlug) closeCheckpoint();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  function openCheckpoint(slug: string, source: "marker" | "list") {
    if (new URL(window.location.href).searchParams.get("checkpoint") === slug) return;
    lastTriggerRef.current = slug;
    const url = new URL(window.location.href);
    url.searchParams.set("checkpoint", slug);
    window.history.pushState({ ...window.history.state, mayuMapPanel: true, source }, "", url);
    setSelectedSlug(slug);
  }

  function closeCheckpoint() {
    if (!selectedSlug) return;
    const slugToFocus = lastTriggerRef.current ?? selectedSlug;
    if (window.history.state?.mayuMapPanel) {
      window.history.back();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete("checkpoint");
      window.history.replaceState(window.history.state, "", url);
      setSelectedSlug(null);
    }
    focusTrigger(slugToFocus);
  }

  return (
    <section className={styles.section} aria-labelledby="map-heading">
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>調査地点・全6記録</p>
          <h2 id="map-heading">絹糸が結ぶ、富岡の調査路</h2>
        </div>
        <p>地図上の記号か右側の地点一覧を選ぶと、詳しい記録が開きます。</p>
      </div>

      <div className={styles.mapShell}>
        <div className={styles.mapStage}>
          <div
            ref={mapNodeRef}
            className={styles.map}
            role="region"
            aria-label="富岡謎解き全チェックポイント地図"
          />
          {mapState === "loading" && <p className={styles.mapMessage}>地図資料を展開しています…</p>}
          {(mapState === "limited" || mapState === "failed") && (
            <div className={styles.mapMessage} role="status">
              <strong>地図画像を十分に読み込めませんでした。</strong>
              <span>右側の地点一覧とGoogleマップのリンクは引き続き利用できます。</span>
            </div>
          )}
          <div className={styles.legend} aria-label="地図記号の説明">
            <span><i className={styles.startKey} />始点・終点</span>
            <span><i className={styles.pointKey} />チェックポイント</span>
            <span><i className={styles.annexKey} />解答・休憩地点</span>
          </div>
        </div>

        <aside className={`${styles.sidePanel} ${selected ? styles.sidePanelOpen : ""}`} aria-label={selected ? `${selected.name}の地点詳細` : "チェックポイント一覧"}>
          {selected ? (
            <article className={styles.detail}>
              <div className={styles.detailTopline}>
                <span className={styles.recordNumber}>{selected.shortName}</span>
                <button ref={closeButtonRef} type="button" className={styles.closeButton} onClick={closeCheckpoint} aria-label={`${selected.name}の詳細を閉じる`}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className={styles.detailVisual}>
                <Image src="/images/route-thread.webp" alt="古地図を思わせる調査ルートのイメージ" fill sizes="(max-width: 899px) 100vw, 390px" />
              </div>
              <p className={styles.detailKicker}>FIELD RECORD / {selected.id.toUpperCase()}</p>
              <h3>{selected.formalName ?? selected.name}</h3>
              <p className={styles.description}>{selected.description}</p>

              <dl className={styles.facts}>
                <div><dt>所在地</dt><dd>{selected.address}</dd></div>
                <div><dt>公開時間</dt><dd>{selected.openingHours ?? "運営確認後に掲載"}</dd></div>
                <div><dt>休業情報</dt><dd>{selected.closedDays ?? "運営確認後に掲載"}</dd></div>
              </dl>

              {selected.notice && <p className={styles.notice}><strong>現地での注意</strong>{selected.notice}</p>}
              <div className={`${styles.status} ${styles[selected.sourceStatus]}`}>
                <strong>{statusCopy[selected.sourceStatus].label}</strong>
                <span>{statusCopy[selected.sourceStatus].detail}</span>
              </div>
              <p className={styles.source}>情報源：{selected.sourceLabel}</p>
              <div className={styles.actions}>
                <a href={selected.googleMapsUrl} target="_blank" rel="noopener noreferrer">Googleマップで開く</a>
                <Link href={`/checkpoints/${selected.slug}/`}>地点詳細へ</Link>
              </div>
            </article>
          ) : (
            <div className={styles.indexPanel}>
              <p className={styles.indexLabel}>ROUTE INDEX</p>
              <h3>調査地点一覧</h3>
              <ol>
                {checkpoints.map((checkpoint) => (
                  <li key={checkpoint.id}>
                    <button
                      ref={(node) => {
                        if (node) listButtonsRef.current.set(checkpoint.slug, node);
                        else listButtonsRef.current.delete(checkpoint.slug);
                      }}
                      type="button"
                      onClick={() => openCheckpoint(checkpoint.slug, "list")}
                    >
                      <span>{checkpoint.shortName}</span>
                      <span><strong>{checkpoint.name}</strong><small>{checkpoint.address.replace("群馬県富岡市", "")}</small></span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className={styles.indexNote}>CP02は岡重で手がかりを確認し、銀座まちなか交流館へ移動して解きます。</p>
            </div>
          )}
        </aside>
      </div>
      <p className="visually-hidden" aria-live="polite">{selected ? `${selected.name}の地点詳細を開きました。` : "地点詳細を閉じました。"}</p>
    </section>
  );
}
