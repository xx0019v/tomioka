export const AnalyticsEvent = {
  MapView: "map_view",
  SpotSelect: "spot_select",
  LocateClick: "locate_click",
  GeoPermission: "geo_permission",
  GoogleMapsClick: "google_maps_click",
  ShareClick: "share_click",
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
