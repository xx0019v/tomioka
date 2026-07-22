export const AnalyticsEvent = {
  GameStart: "game_start",
  CheckpointView: "checkpoint_view",
  HintOpen: "hint_open",
  AnswerSubmit: "answer_submit",
  AnswerResult: "answer_result",
  CheckpointComplete: "checkpoint_complete",
  MapView: "map_view",
  CheckpointSelect: "checkpoint_select",
  CheckpointPageClick: "checkpoint_page_click",
  LocateClick: "locate_click",
  GeoPermission: "geo_permission",
  GoogleMapsClick: "google_maps_click",
  FinalView: "final_view",
  ClearView: "clear_view",
  ShareClick: "share_click",
  EmergencyBannerView: "emergency_banner_view",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  name: AnalyticsEventName,
  params: EventParams = {},
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
