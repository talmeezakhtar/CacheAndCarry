import { aed } from "./quote";
import { ar } from "./i18n-ar";

/*
 * English and Arabic. English is the source text: every string in the code is written in English and passed
 * through t(), which returns it unchanged on English pages and looks it up in lib/i18n-ar.ts on /ar pages.
 * Placeholders such as {name} are filled the same way in both languages.
 */

export type Locale = "en" | "ar";
export type Vars = Record<string, string | number>;

const fill = (s: string, vars?: Vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s);

export function translate(locale: Locale, key: string, vars?: Vars) {
  if (locale === "en") return fill(key, vars);
  const hit = ar[key];
  if (hit === undefined && process.env.NODE_ENV !== "production") console.warn(`[i18n] no Arabic for: ${JSON.stringify(key)}`);
  return fill(hit ?? key, vars);
}

/** Prices: "AED 1,299" in English, "1,299 د.إ" in Arabic (Western digits, as on UAE receipts). */
export const money = (locale: Locale, n: number | null) =>
  locale === "en" ? aed(n) : n == null ? "[للتأكيد] د.إ" : `${n.toLocaleString("en-US")} د.إ`;

/** A site path in this language: "/estimate" stays as is in English and becomes "/ar/estimate" in Arabic. */
export const localePath = (locale: Locale, p: string) => {
  if (locale === "en") return p;
  if (p === "/") return "/ar";
  if (p.startsWith("/#") || p.startsWith("/?")) return `/ar${p.slice(1)}`;
  return `/ar${p}`;
};

export type I18n = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: string, vars?: Vars) => string;
  money: (n: number | null) => string;
  path: (p: string) => string;
};

export const i18n = (locale: Locale): I18n => ({
  locale,
  dir: locale === "ar" ? "rtl" : "ltr",
  t: (key, vars) => translate(locale, key, vars),
  money: (n) => money(locale, n),
  path: (p) => localePath(locale, p),
});
