/*
 * The analytics vocabulary: every event the site may record, the details each one may carry, and the values those
 * details may take. The browser (lib/analytics/client.ts) and the server (app/api/e/route.ts) share this file, and the
 * server drops anything not listed here. No names, phone numbers, typed text or IP addresses are ever part of an event.
 * Plain TypeScript with no imports, so the tests can load it directly (node lib/analytics.test.mjs).
 */

export const PACKAGES = ["Starter", "Business", "Pro", "Store", "Quote"] as const;
export const PLANS = ["Go Live", "Care+", "Growth", "none"] as const;
/** Every WhatsApp button on the site, by where it sits. */
export const BUTTONS = ["hero", "nav", "offer_bar", "floating", "footer", "faq", "ticket", "care_plan", "builder_send", "starter_link", "other"] as const;
export const BANDS = ["under_500", "500_1000", "over_1000", "quoted"] as const;
export const SECTIONS = ["work", "how", "prices", "faq", "compare", "builder"] as const;

type Rule = readonly string[] | "number" | "boolean";
/** Event name → the details it may carry → allowed values (a list, or a number or boolean). */
export const EVENTS = {
  page_view: {},
  section_reach: { section: SECTIONS },
  whatsapp_click: { button: BUTTONS, package: PACKAGES, plan: PLANS },
  builder_send: { package: PACKAGES, addons: "number", band: BANDS, care: PLANS, founding: "boolean" },
  ticket_click: { package: PACKAGES },
  compare_pick: { pair: PACKAGES.flatMap((a) => PACKAGES.map((b) => `${a}/${b}`)) },
  faq_open: { tab: ["Domain", "Edits", "Start", "Arabic", "Payment", "Plans", "Google", "Limits"] },
  care_toggle: { billing: ["monthly", "yearly"] },
  lang_switch: { to: ["en", "ar"] },
  offer_close: {},
} as const satisfies Record<string, Record<string, Rule>>;

export type EventName = keyof typeof EVENTS;
export type Props = Record<string, string | number | boolean>;

export const LIMITS = { body: 4096, path: 200, host: 100, utm: 60, perHour: 300 } as const;

/** The estimate's size, never the exact figure. */
export const bandOf = (total: number | null): (typeof BANDS)[number] =>
  total == null ? "quoted" : total < 500 ? "under_500" : total <= 1000 ? "500_1000" : "over_1000";

/** What the browser sends: n = event, p = path, l = language, r = referrer host, u = UTM tags, d = details. */
export type Wire = { n: string; p: string; l: string; r?: string; u?: { s?: string; m?: string; c?: string }; d?: Record<string, unknown> };

export type CleanEvent = {
  name: EventName;
  path: string;
  locale: "en" | "ar";
  referrer: string | null;
  utm: { source: string | null; medium: string | null; campaign: string | null };
  props: Props;
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max) : "");
const utm = (v: unknown) => str(v, LIMITS.utm).toLowerCase().replace(/[^a-z0-9._-]/g, "") || null;

/** Checks an incoming event against the vocabulary. Returns null for anything unknown or malformed. */
export function clean(raw: unknown): CleanEvent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const w = raw as Wire;
  if (typeof w.n !== "string" || !Object.hasOwn(EVENTS, w.n)) return null;
  const name = w.n as EventName;

  // path only, never a query string (the builder keeps its choices there)
  const path = str(w.p, LIMITS.path).split(/[?#]/)[0];
  if (!path.startsWith("/")) return null;
  const locale = w.l === "ar" ? "ar" : "en";

  const host = str(w.r, LIMITS.host).toLowerCase();
  const referrer = /^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) ? host.replace(/^www\./, "") : null;

  const rules: Record<string, Rule> = EVENTS[name];
  const props: Props = {};
  for (const [key, value] of Object.entries(w.d ?? {})) {
    const rule = rules[key];
    if (!rule) continue;
    if (rule === "number") {
      if (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100) props[key] = Math.round(value);
    } else if (rule === "boolean") {
      if (typeof value === "boolean") props[key] = value;
    } else if (typeof value === "string" && rule.includes(value)) props[key] = value;
  }

  const u = w.u ?? {};
  return { name, path, locale, referrer, utm: { source: utm(u.s), medium: utm(u.m), campaign: utm(u.c) }, props };
}
