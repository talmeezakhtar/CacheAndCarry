/*
 * Plain-language advice from the dashboard numbers. Fixed rules, no guessing: each rule speaks only when its
 * segment has enough data (MIN visitors or events), and each names the action to take. Pure functions over the
 * dashboard data, so the tests can check them (lib/analytics.test.mjs). No imports, for the same reason.
 */

export const MIN = 30;

type Count = { key: string; n: number };
type Row = { key: string; visitors: number; clickers: number };
type Data = {
  current: { visitors: number; clickers: number; builderSends: number };
  previous: { visitors: number; clickers: number };
  funnel: { reachedPrices: number; openedBuilder: number; sentBuilder: number };
  clicksByButton: Count[];
  clicksByPackage: Count[];
  builderBands: Count[];
  locales: { locale: string; visitors: number; clickers: number }[];
  devices: Row[];
  sources: Row[];
  faqs: Count[];
  offerCloses: number;
};

export type Insight = { tone: "good" | "watch" | "act"; title: string; action: string };

const pct = (n: number) => `${Math.round(n * 100)}%`;
const rate = (clickers: number, visitors: number) => (visitors ? clickers / visitors : 0);
const sum = (rows: Count[]) => rows.reduce((s, r) => s + r.n, 0);

/** The buttons a visitor can see on the site; one that never gets a click is worth moving or removing. */
const VISIBLE_BUTTONS = ["hero", "nav", "ticket", "care_plan", "builder_send", "floating", "footer", "faq"];
const BUTTON_NAMES: Record<string, string> = {
  hero: "hero button", nav: "navbar button", ticket: "package “Ask about” links", care_plan: "care plan buttons",
  builder_send: "price builder’s Send button", floating: "floating phone button", footer: "footer buttons", faq: "FAQ “Ask on WhatsApp”",
  offer_bar: "founding-offer bar", starter_link: "“Start with Starter” link",
};
const BAND_NAMES: Record<string, string> = { under_500: "under AED 500", "500_1000": "AED 500–1,000", over_1000: "over AED 1,000", quoted: "quoted" };

export function insights(d: Data): Insight[] {
  const out: Insight[] = [];
  const overall = rate(d.current.clickers, d.current.visitors);

  if (d.current.visitors < MIN) {
    return [
      {
        tone: "watch",
        title: `Not enough visits yet for advice (${d.current.visitors} of ${MIN})`,
        action: "Share the site link on WhatsApp status, Instagram and Google Business Profile. Add ?utm_source=instagram (or the channel name) to each link so you can see which one works.",
      },
    ];
  }

  // 1. the headline: click rate against the period before
  if (d.previous.visitors >= MIN) {
    const before = rate(d.previous.clickers, d.previous.visitors);
    if (before > 0 && overall < before * 0.7)
      out.push({ tone: "act", title: `WhatsApp click rate fell from ${pct(before)} to ${pct(overall)}`, action: "Think back to what changed on the site or in your posts this period, and undo or rethink it." });
    else if (before > 0 && overall > before * 1.3)
      out.push({ tone: "good", title: `WhatsApp click rate rose from ${pct(before)} to ${pct(overall)}`, action: "Note what you changed this period and keep doing it." });
  }

  // 2. English vs Arabic
  const en = d.locales.find((l) => l.locale === "en");
  const ar = d.locales.find((l) => l.locale === "ar");
  if (en && ar && en.visitors >= MIN && ar.visitors >= MIN) {
    const re = rate(en.clickers, en.visitors);
    const ra = rate(ar.clickers, ar.visitors);
    if (ra < re * 0.6) out.push({ tone: "act", title: `Arabic visitors message you less (${pct(ra)} vs ${pct(re)} in English)`, action: "Have a native Arabic speaker read /ar, and check that the Arabic WhatsApp messages read naturally." });
    else if (re < ra * 0.6) out.push({ tone: "watch", title: `English visitors message you less (${pct(re)} vs ${pct(ra)} in Arabic)`, action: "Compare the English hero and package wording with what works in Arabic." });
  }

  // 3. prices → builder → send
  const f = d.funnel;
  if (f.reachedPrices >= MIN && f.openedBuilder / f.reachedPrices < 0.15)
    out.push({ tone: "act", title: `Only ${pct(f.openedBuilder / f.reachedPrices)} of people who see the prices open the price builder`, action: "Make “Build your estimate” more visible, or test a simpler first step such as one “Get my price” button." });
  if (f.openedBuilder >= MIN && f.sentBuilder / f.openedBuilder < 0.1)
    out.push({ tone: "act", title: `Only ${pct(f.sentBuilder / f.openedBuilder)} of builder visitors send their estimate`, action: "The builder may feel long: try fewer add-ons on show, or a Send button higher up on phones." });

  // 4. demand clusters on one package
  const pkgTotal = sum(d.clicksByPackage);
  const top = d.clicksByPackage[0];
  if (pkgTotal >= 20 && top && top.n / pkgTotal >= 0.5)
    out.push({ tone: "good", title: `${top.key} brings ${pct(top.n / pkgTotal)} of package enquiries`, action: `Lead with ${top.key}: put it first, and shape the founding offer and your posts around it.` });

  // 5. buttons nobody uses
  const clickTotal = sum(d.clicksByButton);
  if (clickTotal >= 50) {
    const used = new Set(d.clicksByButton.map((b) => b.key));
    const unused = VISIBLE_BUTTONS.filter((b) => !used.has(b));
    if (unused.length) out.push({ tone: "watch", title: `No clicks on the ${unused.map((b) => BUTTON_NAMES[b] ?? b).join(", ")}`, action: "Move these, change their wording, or remove them so the buttons that work stand out." });
    const best = d.clicksByButton[0];
    if (best) out.push({ tone: "good", title: `The ${BUTTON_NAMES[best.key] ?? best.key} brings the most messages (${pct(best.n / clickTotal)})`, action: "Keep it where it is, and copy its wording to weaker buttons." });
  }

  // 6. a traffic source that visits but does not message
  for (const s of d.sources) {
    if (s.visitors >= MIN && d.current.visitors && s.visitors / d.current.visitors >= 0.25 && rate(s.clickers, s.visitors) < overall * 0.5)
      out.push({ tone: "watch", title: `${s.key} brings ${pct(s.visitors / d.current.visitors)} of visits but few messages`, action: `Check what your ${s.key} posts promise; the page may not match what people expect.` });
  }

  // 7. phones vs desktop
  const phone = d.devices.find((x) => x.key === "phone");
  const desktop = d.devices.find((x) => x.key === "desktop");
  if (phone && desktop && phone.visitors >= MIN && desktop.visitors >= MIN && rate(phone.clickers, phone.visitors) < rate(desktop.clickers, desktop.visitors) * 0.6)
    out.push({ tone: "act", title: "Phone visitors message you much less than desktop visitors", action: "Test the site on a phone from top to bottom; check the WhatsApp buttons are easy to reach." });

  // 8. one FAQ question dominates
  const faqTotal = sum(d.faqs);
  if (faqTotal >= 20 && d.faqs[0] && d.faqs[0].n / faqTotal >= 0.4)
    out.push({ tone: "watch", title: `“${d.faqs[0].key}” is the most-opened FAQ (${pct(d.faqs[0].n / faqTotal)})`, action: "Answer it higher on the page: in the trust strip or on the package cards." });

  // 9. estimate size
  const bandTotal = sum(d.builderBands);
  const over = d.builderBands.find((b) => b.key === "over_1000");
  if (bandTotal >= 10 && over && over.n / bandTotal >= 0.5)
    out.push({ tone: "watch", title: `${pct(over.n / bandTotal)} of sent estimates are ${BAND_NAMES.over_1000}`, action: "Buyers want bigger sites than the Starter: consider a Business bundle with the add-ons they pick most." });

  // 10. founding bar closed more than claimed
  const claims = d.clicksByButton.find((b) => b.key === "offer_bar")?.n ?? 0;
  if (d.offerCloses >= 20 && d.offerCloses > claims * 5)
    out.push({ tone: "watch", title: `The founding-offer bar is closed ${d.offerCloses} times for ${claims} claims`, action: "Try clearer wording, or show the offer inside the prices section instead of the top bar." });

  if (!out.length) out.push({ tone: "good", title: "Nothing stands out this period", action: "Keep posting, and change one thing at a time so its effect shows here." });
  return out;
}
