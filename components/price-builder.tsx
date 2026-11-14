"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Check, ChevronDown, Link2, Minus, Plus, X } from "lucide-react";
import { addOns as menu, carePlans, founding as offer, packages, paymentTerms, site, wa, type AddOn } from "@/lib/site";
import { followPages, message, needsQuote, quoteReason, total, type Line } from "@/lib/quote";
import { useI18n } from "@/components/locale-provider";
import { bandOf } from "@/lib/analytics/events";

/*
 * Price builder (PDF 6.9). Choices on the left, an itemised receipt on the right that stays in view
 * (a docked total bar on phones), live totals, what each package already includes, the monthly care plan
 * and the first-year total. Above AED 1,000 the figure still shows; the written quote confirms it.
 * The choices (not the name or area) are kept in the page link, so a refresh or a forwarded link restores them.
 */

const choices = [
  { key: "Starter", pkg: packages[0] },
  { key: "Business", pkg: packages[1] },
  { key: "Quote", pkg: null },
] as const;
type Key = (typeof choices)[number]["key"];
/** Other parts of the page (the package comparison) pick a package by sending this event with the choice's key. */
export const PICK_PACKAGE = "vp:pick-package";
export type PickPackage = Key;
const SELF = "self"; // host it yourself, no care plan

const groups = [...new Set(menu.map((a) => a.group))];
const ease = [0.16, 1, 0.3, 1] as const;
const MAX_PAGES = 12;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** Add-ons priced per page of the site (not "Extra page", which adds pages): they follow the page count. */
const perPageLabels = menu.filter((a) => a.perPage && a.label !== "Extra page").map((a) => a.label);
const pagesFor = (key: Key, qty: Record<string, number>) => {
  const p = choices.find((c) => c.key === key)!.pkg;
  return p ? (p.pages ?? 1) + (qty["Extra page"] ?? 0) : 0;
};
/** Rush delivery and the like apply to some packages only. */
const fits = (a: AddOn, pkgLabel?: string) => !a.only || (pkgLabel != null && a.only.includes(pkgLabel));
const offerOpen = offer.left > 0;

/** "Arabic version, per page" with 3 pages becomes "Arabic version × 3". */
const lineFor = (a: AddOn, n: number): Line =>
  a.perPage && n > 1 ? { label: `${a.label.replace(/, per page$/, "")} × ${n}`, price: a.price == null ? null : a.price * n } : a;

/** Read ?p=business&a=extra-page.2,simple-logo&c=care&f=1 into builder state; unknown values are ignored. */
function parse(search: string) {
  const q = new URLSearchParams(search);
  const pick = choices.find((c) => c.key.toLowerCase() === q.get("p"))?.key;
  const qty: Record<string, number> = {};
  for (const part of (q.get("a") ?? "").split(",")) {
    const [s, n] = part.split(".");
    const a = menu.find((m) => slug(m.label) === s);
    if (a) qty[a.label] = Math.max(1, Math.min(MAX_PAGES, Number(n) || 1));
  }
  const c = q.get("c");
  const care = c === SELF ? SELF : carePlans.find((p) => slug(p.label) === c)?.label;
  return { pick, qty, care, founding: offerOpen && q.get("f") === "1" };
}

/** The builder's choices as a query string (the inverse of parse). */
function serialise(pick: Key, qty: Record<string, number>, care: string, founding: boolean) {
  const q = new URLSearchParams();
  if (pick !== "Starter") q.set("p", pick.toLowerCase());
  const a = Object.entries(qty)
    .filter(([, n]) => n > 0)
    .map(([label, n]) => (n > 1 ? `${slug(label)}.${n}` : slug(label)));
  if (a.length) q.set("a", a.join(","));
  if (care !== carePlans[0].label) q.set("c", care === SELF ? SELF : slug(care));
  if (founding && pick === "Starter") q.set("f", "1");
  return q.toString().replace(/%2C/g, ",");
}

export function PriceBuilder() {
  const { t, money: aed, path, locale } = useI18n();
  const fmt = { t, money: aed };
  const [pick, setPick] = useState<Key>("Starter");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [care, setCare] = useState<string>(carePlans[0].label);
  const [founding, setFounding] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [copied, setCopied] = useState(false);
  const restored = useRef(false);

  // Restore choices from the link once, after hydration (a timeout, so the page renders the defaults first).
  useEffect(() => {
    const s = parse(location.search);
    const t = setTimeout(() => {
      if (s.pick) setPick(s.pick);
      if (Object.keys(s.qty).length) setQty(s.qty);
      if (s.care) setCare(s.care);
      if (s.founding) setFounding(true);
      restored.current = true;
    });
    return () => clearTimeout(t);
  }, []);

  const qs = serialise(pick, qty, care, founding);
  // Keep the link in step with the choices (replaceState: no history entries, no scroll jump).
  useEffect(() => {
    if (!restored.current) return;
    history.replaceState(null, "", `${location.pathname}${qs ? `?${qs}` : ""}${location.hash}`);
  }, [qs]);

  const choice = choices.find((c) => c.key === pick)!;
  const pkg = choice.pkg;
  const isFounding = offerOpen && founding && pick === "Starter";
  const pkgLine: Line | null = pkg ? { label: pkg.label, price: isFounding ? offer.price : pkg.price } : null;
  const included = new Set<string>(pkg?.items ?? []);
  const pages = pagesFor(pick, qty); // more than 8 pages is quoted too
  /** Per-page add-ons never count more pages than the site has (a restored link could ask for more). */
  const count = (a: AddOn) => (perPageLabels.includes(a.label) ? Math.min(qty[a.label] ?? 0, pages) : (qty[a.label] ?? 0));
  const chosen = pkgLine ? menu.filter((a) => count(a) > 0 && !included.has(a.label) && fits(a, pkg?.label)) : [];
  const kept = menu.filter((a) => (qty[a.label] ?? 0) > 0).length; // add-ons waiting while "Bigger site" is picked
  // The receipt and the message show labels in the page's language; the logic above keys on the English labels.
  const nameOf = (a: AddOn, n: number) => (a.perPage && n > 1 ? `${t(a.label).replace(t(", per page"), "")} × ${n}` : t(a.label));
  const lines = chosen.map((a) => ({ ...lineFor(a, count(a)), label: nameOf(a, count(a)) }));
  const sum = pkgLine ? total([pkgLine, ...lines]) : null;
  const over = needsQuote(sum, pages);
  const plan = carePlans.find((p) => p.label === care) ?? null;
  const careLine: Line | null = plan ? { label: plan.label, price: plan.price } : null;
  const link = `${site.url}${path("/estimate")}${qs ? `?${qs}` : ""}`;
  const local = (l: Line | null) => (l ? { ...l, label: t(l.label) } : null);
  const text = message(local(pkgLine), lines, name, area, { care: local(careLine), pages, founding: isFounding, link }, fmt);
  const firstYear = sum != null && plan ? { monthly: sum + plan.price * 12, yearly: sum + plan.price * 10 } : null;

  /** Change the package and add-ons together, so per-page add-ons follow a new page count. */
  const update = (nextPick: Key, nextQty: Record<string, number>) => {
    const from = pagesFor(pick, qty);
    const to = pagesFor(nextPick, nextQty);
    setPick(nextPick);
    setQty(from > 0 && to > 0 && from !== to ? followPages(nextQty, perPageLabels, from, to) : nextQty);
  };
  // A package picked elsewhere on the page (the comparison table); a ref keeps the listener on the latest update().
  const updateRef = useRef(update);
  useEffect(() => {
    updateRef.current = update;
  });
  useEffect(() => {
    const onPick = (e: Event) => {
      const key = (e as CustomEvent<Key>).detail;
      if (choices.some((c) => c.key === key)) updateRef.current(key, qty);
    };
    window.addEventListener(PICK_PACKAGE, onPick);
    return () => window.removeEventListener(PICK_PACKAGE, onPick);
  }, [qty]);
  const maxFor = (a: AddOn) => (perPageLabels.includes(a.label) ? Math.min(MAX_PAGES, pages) : MAX_PAGES);
  const set = (label: string, n: number) => {
    const a = menu.find((m) => m.label === label)!;
    update(pick, { ...qty, [label]: Math.max(0, Math.min(maxFor(a), n)) });
  };
  /** Per-page add-ons start at the site's page count: Arabic for a 4-page Business site is 4 pages. */
  const startCount = (a: AddOn) => (perPageLabels.includes(a.label) ? Math.max(1, pages) : 1);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the address bar still holds the link */
    }
  };

  const headline = pkgLine ? aed(sum) : t("Quoted on WhatsApp");
  const kicker = t(!pkgLine ? "Next step" : over ? "Estimate, to confirm in writing" : "Estimate");
  const send = (compact = false) => (
    <a
      href={wa(text)}
      // analytics: the estimate's size and shape, never the name, area or exact total
      data-track="builder_send"
      data-package={pick}
      data-addons={chosen.length}
      data-band={bandOf(sum)}
      data-care={plan ? plan.label : "none"}
      data-founding={String(isFounding)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-surface font-bold text-ink transition-[transform,background-color] hover:bg-white active:scale-[0.98] ${compact ? "px-4 text-sm" : "px-6"}`}
    >
      {t("Send on WhatsApp")}
    </a>
  );

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease }}>
      <div id="builder">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
          {/* Choices */}
          <div className="space-y-10">
            <fieldset>
              <legend className="font-heading text-2xl">{t("1. Start with a package")}</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {choices.map((c) => (
                  <label
                    key={c.key}
                    className="group relative flex cursor-pointer flex-col rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-ink/40 has-checked:border-accent has-checked:bg-sage-wash has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent sm:p-5"
                  >
                    <input type="radio" name="package" checked={pick === c.key} onChange={() => update(c.key, qty)} className="sr-only" />
                    <span
                      aria-hidden
                      className="absolute top-4 end-4 grid size-6 place-items-center rounded-full border border-ink/25 text-surface transition-colors group-has-checked:border-accent group-has-checked:bg-accent"
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="font-bold">{c.pkg ? t(c.pkg.label) : t("Bigger site")}</span>
                    <span className="mt-1 font-heading text-xl tabular-nums sm:mt-3 sm:text-2xl">
                      {c.pkg ? aed(c.key === "Starter" && isFounding ? offer.price : c.pkg.price) : t("Quoted")}
                    </span>
                    <span className="mt-1 text-sm text-ink/80">{c.pkg ? t(c.pkg.note) : t("Pro or Store, priced in writing")}</span>
                  </label>
                ))}
              </div>
              {pkg && (
                <p className="mt-3 text-sm text-ink/80">
                  <span className="font-bold text-ink">{t("Includes:")}</span> {pkg.items.map((x) => t(x)).join(t("; "))}.
                </p>
              )}
              {pick === "Starter" && offerOpen && (
                <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm has-checked:border-accent has-checked:bg-sage-wash has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
                  <input type="checkbox" checked={founding} onChange={(e) => setFounding(e.target.checked)} className="size-4 accent-accent" />
                  <span>
                    <span className="font-bold">{t("Founding place: {price} instead of {was}", { price: aed(offer.price), was: aed(offer.was) })}</span>
                    {t(", in return for a short testimonial.")}{" "}
                    {offer.left < offer.places ? t("{left} of {places} left.", { left: offer.left, places: offer.places }) : t("{places} places.", { places: offer.places })}
                  </span>
                </label>
              )}
            </fieldset>

            {pkgLine ? (
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-heading text-2xl">{t("2. Add what you need")}</h4>
                  {chosen.length > 0 && (
                    <button type="button" onClick={() => update(pick, {})} className="min-h-11 text-sm font-bold text-accent underline-offset-4 hover:underline">
                      {t("Clear add-ons")}
                    </button>
                  )}
                </div>
                <div className="mt-4 space-y-7">
                  {groups.map((g) => (
                    <fieldset key={g}>
                      <legend className="mb-2.5 text-sm font-bold text-ink/80">{t(g)}</legend>
                      {/* one ruled sheet per group: 1px gaps over the line colour draw the rules between rows */}
                      <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
                        {menu
                          .filter((a) => a.group === g && fits(a, pkg?.label))
                          .map((a) => {
                            const n = count(a);
                            const inPkg = included.has(a.label);
                            const on = n > 0 && !inPkg;
                            return (
                              <div
                                key={a.label}
                                className={`transition-colors sm:last:odd:col-span-2 ${inPkg ? "bg-page" : on ? "bg-sage-wash" : "bg-surface hover:bg-sage-wash/50"}`}
                              >
                                <label className={`flex min-h-12 items-center gap-3 px-4 py-2.5 ${inPkg ? "text-ink/80" : "cursor-pointer"}`}>
                                  <input
                                    type="checkbox"
                                    checked={on || inPkg}
                                    disabled={inPkg}
                                    onChange={() => set(a.label, on ? 0 : startCount(a))}
                                    className="peer sr-only"
                                  />
                                  <span
                                    aria-hidden
                                    className={`grid size-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                                      on || inPkg ? "border-accent bg-accent text-surface" : "border-ink/30"
                                    }`}
                                  >
                                    {(on || inPkg) && <Check className="size-3.5" strokeWidth={3} />}
                                  </span>
                                  <span className="flex-1 leading-snug">{t(a.label)}</span>
                                  <span className="whitespace-nowrap text-sm text-ink/80 tabular-nums">
                                    {inPkg ? t("Included") : `${aed(a.price)}${a.perPage ? t(" each") : ""}`}
                                  </span>
                                </label>
                                {on && a.perPage && (
                                  <div className="border-t border-accent/25 px-4 py-2 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                      <span id={`n-${slug(a.label)}`}>{t("How many pages?")}</span>
                                      <span className="flex items-center gap-1" role="group" aria-labelledby={`n-${slug(a.label)}`}>
                                        <button
                                          type="button"
                                          aria-label={t("One fewer page")}
                                          onClick={() => set(a.label, n - 1)}
                                          className="grid size-10 place-items-center rounded-full hover:bg-ink/10"
                                        >
                                          <Minus className="size-4" />
                                        </button>
                                        <output className="w-6 text-center font-bold tabular-nums" aria-live="polite">
                                          {n}
                                        </output>
                                        <button
                                          type="button"
                                          aria-label={t("One more page")}
                                          disabled={n >= maxFor(a)}
                                          onClick={() => set(a.label, n + 1)}
                                          className="grid size-10 place-items-center rounded-full hover:bg-ink/10 disabled:opacity-40"
                                        >
                                          <Plus className="size-4" />
                                        </button>
                                      </span>
                                    </div>
                                    {n >= maxFor(a) && (
                                      <p className="pb-1 text-ink/80">
                                        {maxFor(a) < MAX_PAGES ? t("That's every page of your site.") : t("More than {n}? Ask in your message.", { n: MAX_PAGES })}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-surface p-6">
                <h4 className="font-heading text-xl">{t("Quoted in writing")}</h4>
                <p className="mt-2 max-w-[60ch] text-ink/80">
                  {t("Pro from {pro} (up to 7 pages). Store from {store}. Tell us what you sell and we send a quote.", { pro: aed(packages[2].price), store: aed(packages[3].price) })}
                </p>
                {kept > 0 && (
                  <p className="mt-3 text-sm text-ink/80">
                    {locale === "en"
                      ? `Your ${kept} add-on${kept > 1 ? "s are" : " is"} saved for Starter or Business.`
                      : t("Your add-ons ({n}) are saved for Starter or Business.", { n: kept })}
                  </p>
                )}
              </div>
            )}

            {/* Monthly care: needed for hosting, so it belongs in the estimate (PDF 6.5). */}
            <fieldset>
              <legend className="font-heading text-2xl">{t("3. Keep it running")}</legend>
              <p className="mt-1 text-sm text-ink/80">{t("Hosting, renewals and small edits.")}</p>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  ...carePlans.map((p) => ({ key: p.label, title: t(p.label), note: t("{price} a month", { price: aed(p.price) }) })),
                  { key: SELF, title: t("No plan"), note: t("I'll host it myself") },
                ].map(
                  (o) => (
                    <label
                      key={o.key}
                      className="flex min-h-14 cursor-pointer flex-col justify-center rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-ink/40 has-checked:border-accent has-checked:bg-sage-wash has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
                    >
                      <input type="radio" name="care" checked={care === o.key} onChange={() => setCare(o.key)} className="sr-only" />
                      <span className="font-bold">{o.title}</span>
                      <span className="text-sm text-ink/80 tabular-nums">{o.note}</span>
                    </label>
                  ),
                )}
              </div>
              {care === SELF && <p className="mt-3 text-sm text-ink/80">{t("Changes after launch are billed each time.")}</p>}
            </fieldset>
          </div>

          {/* Receipt: sticky beside the choices on desktop */}
          {/* the shadow sits on a wrapper: the receipt's torn edge is a mask, which would clip a box-shadow */}
          <div className="drop-shadow-[0_22px_22px_rgb(23_33_27/0.28)] lg:sticky lg:top-6">
          <aside id="estimate" aria-label={t("Your estimate")} className="receipt-edge rounded-t-2xl bg-ink p-6 pb-10 text-surface sm:p-7 sm:pb-11">
            <h4 className="font-heading text-xl">{t("Your estimate")}</h4>

            <ul className="mt-5 space-y-2.5 text-sm">
              <li className="flex justify-between gap-4">
                <span>{pkgLine ? `${t("{label} package", { label: t(pkgLine.label) })}${isFounding ? t(", founding place") : ""}` : t("Bigger site (Pro or Store)")}</span>
                <span className="tabular-nums">{pkgLine ? aed(pkgLine.price) : t("Quoted")}</span>
              </li>
              <AnimatePresence initial={false}>
                {chosen.map((a, i) => (
                  <motion.li key={a.label} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-surface/90">{lines[i].label}</span>
                      <span className="flex shrink-0 items-center gap-1.5 tabular-nums text-surface/90">
                        {aed(lines[i].price)}
                        <button
                          type="button"
                          aria-label={t("Remove {label}", { label: t(a.label) })}
                          onClick={() => set(a.label, 0)}
                          className="-my-1 grid size-7 place-items-center rounded-full text-surface/80 hover:bg-white/10 hover:text-surface"
                        >
                          <X className="size-3.5" />
                        </button>
                      </span>
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {pkgLine && chosen.length === 0 && <p className="mt-2 text-sm text-surface/80">{t("No add-ons yet.")}</p>}

            <div className="mt-6 border-t border-dashed border-white/30 pt-5" aria-live="polite">
              <p className="text-sm text-surface/80">{kicker}</p>
              <motion.p key={headline} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 font-heading text-4xl tabular-nums">
                {headline}
              </motion.p>
              <p className="mt-2 text-sm text-surface/80">
                {!pkgLine
                  ? t("We reply with a written quote.")
                  : over
                    ? t("It's {reason}, so we confirm it in writing.", { reason: quoteReason(sum, pages, fmt) })
                    : `${t(paymentTerms(pkgLine.label))}.`}
              </p>
            </div>

            <div className="mt-5 space-y-2 border-t border-dashed border-white/30 pt-5 text-sm">
              <p className="flex justify-between gap-4">
                <span>
                  {t("Care plan")}
                  {plan ? `${t(", ")}${t(plan.label)}` : ""}
                </span>
                <span className="tabular-nums">{plan ? t("{price} a month", { price: aed(plan.price) }) : t("None")}</span>
              </p>
              {firstYear && (
                <>
                  <p className="flex justify-between gap-4 font-bold">
                    <span>{t("First year in total")}</span>
                    <span className="tabular-nums">{aed(firstYear.monthly)}</span>
                  </p>
                  <p className="text-surface/80">{t("{amount} with yearly care.", { amount: aed(firstYear.yearly) })}</p>
                </>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <label className="grid gap-1.5 text-sm">
                <span className="font-bold">{t("Business name")}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="organization"
                  dir="auto"
                  maxLength={60}
                  className="min-h-11 rounded-lg border border-white/25 bg-white/10 px-3 text-base text-surface outline-none focus:border-sage-light focus:ring-2 focus:ring-sage-light/40"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-bold">
                  {t("Area")} <span className="font-normal text-surface/80">{t("(optional)")}</span>
                </span>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  autoComplete="address-level2"
                  dir="auto"
                  maxLength={40}
                  className="min-h-11 rounded-lg border border-white/25 bg-white/10 px-3 text-base text-surface outline-none focus:border-sage-light focus:ring-2 focus:ring-sage-light/40"
                />
              </label>
            </div>

            <details className="group mt-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-bold [&::-webkit-details-marker]:hidden">
                {t("See the message we prepare")}
                <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              {/* plaintext bidi: each line takes the direction of its own text, so Arabic names read correctly */}
              <p className="mt-1 whitespace-pre-line rounded-lg bg-white/10 p-3 text-sm text-surface/90 [unicode-bidi:plaintext]">{text}</p>
            </details>

            <div className="mt-5 grid">{send()}</div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-surface/80">
              {/* what happens after Send: facts from the FAQ (written quote, valid 7 days), no promised reply time */}
              <span>{t("We reply with a written quote. Nothing is charged here.")}</span>
              <button type="button" onClick={copyLink} className="inline-flex min-h-11 items-center gap-1.5 font-bold text-surface hover:underline">
                <Link2 aria-hidden className="size-3.5" />
                <span aria-live="polite">{t(copied ? "Link copied" : "Copy link")}</span>
              </button>
            </div>
          </aside>
          </div>
        </div>

        {/* Phones: the total stays docked at the bottom while the builder is on screen (the floating WhatsApp button hides). */}
        <div className="sticky bottom-3 z-10 mt-6 flex items-center justify-between gap-3 rounded-2xl bg-ink p-3 pl-5 text-surface shadow-[0_12px_32px_-12px_rgb(23_33_27/0.6)] lg:hidden">
          <a href="#estimate" className="min-w-0">
            <span className="block truncate text-xs text-surface/80">{kicker}</span>
            <span className="block truncate font-heading text-xl tabular-nums">{headline}</span>
          </a>
          {send(true)}
        </div>
      </div>
    </MotionConfig>
  );
}
