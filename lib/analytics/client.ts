import type { EventName, Wire } from "./events";

/*
 * Sends one analytics event from the browser to /api/e (same site, no cookies, no third party).
 * Does nothing on the dashboard, during prerendering, or when the visitor's browser asks not to be tracked
 * (Global Privacy Control).
 */
export function track(name: EventName, details: Record<string, string | number | boolean | undefined> = {}, extra: Pick<Wire, "r" | "u"> = {}) {
  if (typeof window === "undefined") return;
  if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
  if (location.pathname.startsWith("/admin")) return;
  const d = Object.fromEntries(Object.entries(details).filter(([, v]) => v !== undefined && v !== ""));
  const body = JSON.stringify({ n: name, p: location.pathname, l: document.documentElement.lang === "ar" ? "ar" : "en", d, ...extra } satisfies Wire);
  try {
    // sendBeacon survives the page being left (a WhatsApp click opens another app)
    if (navigator.sendBeacon?.("/api/e", new Blob([body], { type: "application/json" }))) return;
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/e", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
}
