// Prices and the WhatsApp message for the price builder.
// Figures come from the project details PDF (section 6), confirmed in the decisions log.
// Setting PRICES_CONFIRMED to false prints every price in brackets ("AED [299]") again, for drafts.
export const PRICES_CONFIRMED = true; // confirmed in cache_carry_decisions_log.xlsx (13 Nov 2026)

/** Anything over this, or a package not on the menu, is quoted in writing on WhatsApp (PDF 6.1). */
export const QUOTE_THRESHOLD = 1000;

export type Line = { label: string; price: number | null };

export const aed = (n: number | null, confirmed = PRICES_CONFIRMED) => {
  if (n == null) return "AED [confirm]";
  const v = n.toLocaleString("en-US");
  return confirmed ? `AED ${v}` : `AED [${v}]`;
};

/** Sum of the lines, or null while any price is missing (never show a partial total). */
export const total = (lines: Line[]): number | null =>
  lines.some((l) => l.price == null) ? null : lines.reduce((s, l) => s + (l.price as number), 0);

/** More pages than this is also quoted in writing (PDF 6.1, 6.9). */
export const PAGE_LIMIT = 8;

/** True when the estimate must be confirmed in a written quote: over AED 1,000 or more than 8 pages. */
export const needsQuote = (sum: number | null, pages = 0) => (sum != null && sum > QUOTE_THRESHOLD) || pages > PAGE_LIMIT;

/**
 * Text for one language: t() turns an English template into the page's language and fills {slots}; money() prints a
 * price. The English default needs no setup (lib/i18n builds the Arabic one); kept here so this file stays importable
 * on its own by the tests.
 */
export type Fmt = { t: (key: string, vars?: Record<string, string | number>) => string; money: (n: number | null) => string };
const fill = (s: string, vars?: Record<string, string | number>) => (vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s);
export const EN: Fmt = { t: fill, money: (n) => aed(n) };

/** Plain reason for the written quote, for the receipt and the message. */
export const quoteReason = (sum: number | null, pages = 0, { t, money }: Fmt = EN) =>
  [sum != null && sum > QUOTE_THRESHOLD && t("over {amount}", { amount: money(QUOTE_THRESHOLD) }), pages > PAGE_LIMIT && t("more than {n} pages", { n: PAGE_LIMIT })]
    .filter(Boolean)
    .join(t(" and "));

/**
 * Per-page add-ons (Arabic, copywriting) follow the site's page count: a count that matched the old page count moves
 * with it, and no count can exceed the pages the site has. `from` and `to` are the old and new page counts.
 */
export const followPages = (qty: Record<string, number>, labels: string[], from: number, to: number) => {
  const out = { ...qty };
  for (const l of labels) if (out[l] > 0) out[l] = out[l] === from ? to : Math.min(out[l], to);
  return out;
};

/** Extra details for the message: the care plan (null: hosts it themselves), page count, founding place and the builder link. */
export type MessageOptions = { care?: Line | null; pages?: number; founding?: boolean; link?: string };

/**
 * The message the visitor sends on WhatsApp, built from the same lines as the total.
 * `pkg` null means "quoted package" (Pro or Store). Wording follows the PDF's templates (section 5).
 * Over AED 1,000 the figure is still sent (prices shown upfront), with a request for the written quote.
 * Prices carry no VAT: the business is not VAT-registered (add a VAT line here once it is).
 */
export const message = (
  pkg: Line | null,
  addOns: Line[],
  name: string,
  area: string,
  { care, pages = 0, founding = false, link }: MessageOptions = {},
  fmt: Fmt = EN,
) => {
  const { t, money } = fmt;
  const out = [pkg ? t("Hi, I'm interested in the {name} package. Could you tell me more?", { name: pkg.label }) : t("Hi, I'd like a quote for a bigger site or an online store.")];
  if (name.trim()) out.push(t("Business: {name}", { name: name.trim() }));
  if (area.trim()) out.push(t("Area: {area}", { area: area.trim() }));
  if (pkg) {
    if (founding) out.push(t("Founding place: yes, {price} in return for a short testimonial.", { price: money(pkg.price) }));
    if (addOns.length) out.push(t("Add-ons: {list}", { list: addOns.map((a) => `${a.label} (${money(a.price)})`).join(t(", ")) }));
    const sum = total([pkg, ...addOns]);
    out.push(
      needsQuote(sum, pages)
        ? t("Estimate: {sum}. It's {reason}, so please send a written quote.", { sum: money(sum), reason: quoteReason(sum, pages, fmt) })
        : t("Estimate: {sum}.", { sum: money(sum) }),
    );
  }
  if (care !== undefined) out.push(care ? t("Care plan: {label}, {price} a month.", { label: care.label, price: money(care.price) }) : t("Care plan: none, I'll host it myself."));
  if (link) out.push(t("My choices: {link}", { link }));
  return out.join("\n");
};
