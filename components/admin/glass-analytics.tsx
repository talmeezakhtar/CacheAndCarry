"use client";

/*
 * Vibe & Pixel analytics dashboard, built on the "Adjustable Glass Dashboard" design (21st.dev): the same top bar,
 * side rail, frosted panels, period switch, two-line chart, bottom dock and "Adjust glass" panel. The finance views
 * (balance, transactions, savings) are replaced by the studio's own: Overview, Leads, Builder, Audience, Insights.
 * Colours come from the site tokens (app/globals.css, shadcn names mapped to the palette); the backdrop is a soft
 * palette gradient instead of a photo, because the security policy only allows images from this domain.
 */

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Check,
  Download,
  Globe,
  Home,
  Lightbulb,
  LogOut,
  MessageCircle,
  Calculator,
  Settings2,
  TriangleAlert,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import type { Count, Dashboard, SourceRow } from "@/lib/analytics/queries";
import type { Insight } from "@/lib/analytics/insights";

gsap.registerPlugin(useGSAP);

export type GlassSettings = { blur: number; opacity: number; saturation: number; tint: string; edge: number };
export type RangeData = Dashboard & { insights: Insight[] };
export type GlassAnalyticsProps = { ranges: RangeData[]; initialDays?: number; generatedAt: string };

const defaults: GlassSettings = { blur: 22, opacity: 0.34, saturation: 1.15, tint: "#eef1e4", edge: 0.6 };
const tabs = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "leads", label: "Leads", icon: MessageCircle },
  { id: "builder", label: "Builder", icon: Calculator },
  { id: "audience", label: "Audience", icon: Users },
  { id: "insights", label: "Insights", icon: Lightbulb },
] as const;
type View = (typeof tabs)[number]["id"];
const titles: Record<View, string> = { overview: "Overview", leads: "WhatsApp leads", builder: "Price builder", audience: "Audience & content", insights: "What to improve" };

const bounded = (v: number, min: number, max: number, fallback: number) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback);
const normalize = (v: Partial<GlassSettings>): GlassSettings => ({
  blur: bounded(v.blur ?? defaults.blur, 0, 40, defaults.blur),
  opacity: bounded(v.opacity ?? defaults.opacity, 0.08, 0.9, defaults.opacity),
  saturation: bounded(v.saturation ?? defaults.saturation, 0.5, 2, defaults.saturation),
  edge: bounded(v.edge ?? defaults.edge, 0, 1, defaults.edge),
  tint: /^#[0-9a-f]{6}$/i.test(v.tint ?? "") ? v.tint! : defaults.tint,
});

const num = new Intl.NumberFormat("en-US");
const fmt = (n: number) => num.format(Number.isFinite(n) ? n : 0);
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");
const change = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : null);
const dayLabel = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Friendly names for the stored keys. */
const NAMES: Record<string, string> = {
  hero: "Hero button", nav: "Navbar", offer_bar: "Founding-offer bar", floating: "Floating button (phones)", footer: "Footer", faq: "FAQ “Ask on WhatsApp”",
  ticket: "Package “Ask about”", care_plan: "Care plan buttons", builder_send: "Builder “Send”", starter_link: "“Start with Starter”", other: "Other",
  under_500: "Under AED 500", "500_1000": "AED 500 – 1,000", over_1000: "Over AED 1,000", quoted: "Quoted (Pro / Store)",
  none: "No care plan", Quote: "Bigger site (Pro / Store)", en: "English", ar: "Arabic", phone: "Phone", desktop: "Desktop", tablet: "Tablet",
  work: "Our work", how: "How it works", prices: "Prices", compare: "Compare (estimate page)", builder: "Price builder",
};
const nameOf = (k: string) => NAMES[k] ?? k;

const ROLE_STORAGE = "vp-admin-glass";

export default function GlassAnalytics({ ranges, initialDays = 30, generatedAt }: GlassAnalyticsProps) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const settingsTrigger = useRef<HTMLButtonElement>(null);
  const id = useId().replace(/:/g, "");
  const [view, setView] = useState<View>("overview");
  const [material, setMaterial] = useState(defaults);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [days, setDays] = useState(initialDays);
  const [notice, setNotice] = useState("");

  // the glass look is a personal preference: remember it in this browser only
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ROLE_STORAGE);
      if (saved) setMaterial(normalize(JSON.parse(saved)));
    } catch {
      /* storage blocked: keep the defaults */
    }
  }, []);
  useEffect(() => {
    if (settingsOpen) root.current?.querySelector<HTMLButtonElement>(".gw-material button")?.focus();
  }, [settingsOpen]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const d = ranges.find((r) => r.days === days) ?? ranges[0];
  const c = d.current;
  const p = d.previous;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const panels = content.current?.querySelectorAll(".gw-reveal");
        if (!panels?.length) return;
        gsap.fromTo(panels, { y: 12, opacity: 0.45, filter: "blur(3px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.48, stagger: 0.045, ease: "power3.out", clearProps: "transform,opacity,filter" });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [view], revertOnUpdate: true },
  );

  function updateGlass(patch: Partial<GlassSettings>) {
    const next = normalize({ ...material, ...patch });
    setMaterial(next);
    try {
      localStorage.setItem(ROLE_STORAGE, JSON.stringify(next));
    } catch {
      /* fine without saving */
    }
  }
  function closeSettings() {
    setSettingsOpen(false);
    settingsTrigger.current?.focus();
  }

  /** Every table on the dashboard for the chosen period, as a spreadsheet. */
  function exportCsv() {
    const cell = (v: string | number) => {
      const s = String(v);
      return `"${(/^[\s]*[=+@-]/.test(s) ? "'" : "") + s.replace(/"/g, '""')}"`;
    };
    const rows: (string | number)[][] = [["Section", "Item", "Value", "Second value"]];
    const add = (section: string, list: Count[]) => list.forEach((r) => rows.push([section, nameOf(r.key), r.n, ""]));
    const addRows = (section: string, list: SourceRow[]) => list.forEach((r) => rows.push([section, nameOf(r.key), r.visitors, r.clickers]));
    rows.push(["Summary", "Visitors", c.visitors, ""], ["Summary", "Page views", c.pageViews, ""], ["Summary", "WhatsApp clicks", c.clicks, ""], ["Summary", "Visitors who clicked", c.clickers, ""], ["Summary", "Builder sends", c.builderSends, ""]);
    d.trend.forEach((t) => rows.push(["Daily (visitors, clicks)", t.day, t.visitors, t.clicks]));
    add("Clicks by button", d.clicksByButton);
    add("Clicks by package", d.clicksByPackage);
    add("Clicks by care plan", d.clicksByPlan);
    add("Builder package", d.builderPackages);
    add("Builder estimate", d.builderBands);
    add("Builder care plan", d.builderCare);
    addRows("Source (visitors, clickers)", d.sources);
    addRows("Device (visitors, clickers)", d.devices);
    d.locales.forEach((l) => rows.push(["Language (visitors, clickers)", nameOf(l.locale), l.visitors, l.clickers]));
    add("FAQ opened", d.faqs);
    add("Sections reached", d.sections);
    const csv = rows.map((r) => r.map(cell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `vibe-and-pixel-analytics-${d.days}-days.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Last ${d.days} days exported.`);
  }

  const nav = (compact = false) => (
    <nav className={compact ? "gw-rail gw-glass" : "gw-dock gw-glass"} aria-label={compact ? "Quick navigation" : "Dashboard views"}>
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          type="button"
          aria-label={compact ? tab.label : undefined}
          title={compact ? tab.label : undefined}
          aria-current={view === tab.id ? "page" : undefined}
          onClick={() => setView(tab.id)}
          onKeyDown={(e) => {
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
            e.preventDefault();
            const last = tabs.length - 1;
            const next = e.key === "Home" ? 0 : e.key === "End" ? last : (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : last)) % tabs.length;
            setView(tabs[next].id);
            (e.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus();
          }}
        >
          <tab.icon size={18} strokeWidth={1.7} aria-hidden="true" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );

  const periodSelector = (label: string) => (
    <div className="gw-segment" role="group" aria-label={label}>
      {ranges.map((r) => (
        <button key={r.days} type="button" aria-pressed={r.days === days} onClick={() => setDays(r.days)}>
          {r.days} days
        </button>
      ))}
    </div>
  );

  // ---- the two-line chart: visitors (moss, filled) and WhatsApp clicks (ink) ----
  const points = d.trend;
  const chartMax = Math.max(1, ...points.flatMap((t) => [t.visitors, t.clicks]));
  const x = (i: number) => (points.length === 1 ? 300 : (i * 600) / (points.length - 1));
  const y = (v: number) => 180 - (Math.max(0, v) / chartMax) * 160;
  const line = (k: "visitors" | "clicks") => points.map((t, i) => `${x(i)},${y(t[k])}`).join(" ");
  const labelIdx = new Set(Array.from({ length: Math.min(points.length, 6) }, (_, i) => (points.length <= 6 ? i : Math.round((i * (points.length - 1)) / 5))));
  const hasTraffic = points.some((t) => t.visitors || t.clicks);
  const chart = hasTraffic ? (
    <div className="gw-chart-wrap">
      <div className="gw-chart-labels">
        <span>{fmt(chartMax)}</span>
        <span>{fmt(Math.round(chartMax / 2))}</span>
        <span>0</span>
      </div>
      <svg viewBox="0 0 600 185" role="img" aria-label={`Last ${d.days} days: ${fmt(c.visitors)} visitors, ${fmt(c.clicks)} WhatsApp clicks.`} preserveAspectRatio="none">
        <desc>{points.map((t) => `${dayLabel(t.day)}: ${t.visitors} visitors, ${t.clicks} WhatsApp clicks`).join(". ")}</desc>
        <defs>
          <linearGradient id={`${id}-area`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--gw-accent)" stopOpacity=".23" />
            <stop offset="1" stopColor="var(--gw-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 100, 180].map((v) => (
          <path key={v} d={`M0 ${v} H600`} stroke="currentColor" opacity=".11" strokeDasharray="3 5" />
        ))}
        <path d={`M${x(0)} 185 ${points.map((t, i) => `L${x(i)} ${y(t.visitors)}`).join(" ")} L${x(points.length - 1)} 185 Z`} fill={`url(#${id}-area)`} />
        <polyline points={line("visitors")} fill="none" stroke="var(--gw-accent)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <polyline points={line("clicks")} fill="none" stroke="currentColor" strokeOpacity=".7" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="gw-chart-months">
        {points.map(
          (t, i) =>
            labelIdx.has(i) && (
              <span
                key={t.day}
                style={{ left: `${x(i) / 6}%`, transform: i === 0 && points.length > 1 ? "none" : i === points.length - 1 && points.length > 1 ? "translateX(-100%)" : "translateX(-50%)" }}
              >
                {dayLabel(t.day)}
              </span>
            ),
        )}
      </div>
    </div>
  ) : (
    <div className="gw-empty gw-chart-empty">
      <ChartNoAxesCombined size={23} aria-hidden="true" />
      <h3>No visits in this period yet</h3>
      <p>The chart fills in as people visit the site.</p>
    </div>
  );

  /** A ranked list with bars, like the design's "Where it goes" panel. */
  const bars = (list: { key: string; n: number; note?: string }[], empty: string) => {
    const top = Math.max(1, ...list.map((r) => r.n));
    return list.length ? (
      <div className="gw-category-list">
        {list.map((r, i) => (
          <div key={r.key}>
            <div>
              <span>{nameOf(r.key)}</span>
              {r.note && <em>{r.note}</em>}
              <strong>{fmt(r.n)}</strong>
            </div>
            <span className="gw-category-track">
              <i style={{ width: `${(r.n / top) * 100}%`, opacity: Math.max(0.45, 1 - i * 0.1) }} />
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="gw-empty gw-empty-small">{empty}</p>
    );
  };
  const withRate = (rows: SourceRow[]) => rows.map((r) => ({ key: r.key, n: r.visitors, note: `${pct(r.clickers, r.visitors)} message` }));

  const delta = (now: number, before: number) => {
    const ch = change(now, before);
    return ch === null ? <span className="gw-flat">new</span> : <span className={ch >= 0 ? "gw-positive" : "gw-negative"}>{ch > 0 ? "+" : ""}{ch}%</span>;
  };

  const f = d.funnel;
  const funnelSteps = [
    { label: "Visited the site", n: f.visited },
    { label: "Saw the prices", n: f.reachedPrices },
    { label: "Opened the price builder", n: f.openedBuilder },
    { label: "Sent an estimate", n: f.sentBuilder },
  ];

  const insightList = (limit?: number) => (
    <ul className="gw-insights">
      {d.insights.slice(0, limit).map((ins) => (
        <li key={ins.title} data-tone={ins.tone}>
          <span className="gw-insight-icon" aria-hidden="true">
            {ins.tone === "good" ? <TrendingUp size={16} /> : ins.tone === "act" ? <TriangleAlert size={16} /> : <Lightbulb size={16} />}
          </span>
          <div>
            <strong>{ins.title}</strong>
            <p>{ins.action}</p>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={root}
      className="gw-root"
      data-theme="light"
      style={
        {
          "--gw-blur": `${material.blur}px`,
          "--gw-opacity": material.opacity,
          "--gw-saturation": material.saturation,
          "--gw-tint": material.tint,
          "--gw-edge": material.edge,
        } as CSSProperties
      }
      onKeyDown={(e) => {
        if (e.key === "Escape" && settingsOpen) closeSettings();
      }}
    >
      <style>{styles}</style>
      <div className="gw-backdrop" aria-hidden="true" />
      <div className="gw-workspace">
        <header className="gw-topbar gw-glass">
          <button type="button" className="gw-brand" onClick={() => setView("overview")}>
            <BrandMark size={34} radius={9} />
            <strong>Vibe &amp; Pixel</strong>
            <span className="gw-brand-divider" />
            <span className="gw-personal">Analytics</span>
          </button>
          <div className="gw-toolbar">
            <button
              type="button"
              className="gw-adjust"
              ref={settingsTrigger}
              onClick={() => setSettingsOpen(!settingsOpen)}
              aria-expanded={settingsOpen}
              aria-controls={`${id}-material`}
            >
              <Settings2 size={16} aria-hidden="true" />
              <span>Adjust glass</span>
            </button>
            <Link className="gw-icon-button" href="/" title="Open the website" aria-label="Open the website">
              <Globe size={17} aria-hidden="true" />
            </Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="gw-icon-button" title="Log out" aria-label="Log out">
                <LogOut size={17} aria-hidden="true" />
              </button>
            </form>
          </div>
        </header>

        <div className="gw-stage">
          {nav(true)}
          <main className="gw-main gw-glass" id="main">
            <div className="gw-view-heading">
              <div>
                <p className="gw-greeting">Last {d.days} days, compared with the {d.days} before</p>
                <h1>{titles[view]}</h1>
              </div>
              <div className="gw-heading-action">
                {periodSelector("Period")}
                <button type="button" className="gw-button" onClick={exportCsv}>
                  <Download size={14} aria-hidden="true" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
            <div className="gw-mobile-nav">{nav()}</div>

            <div ref={content} key={view} className="gw-view">
              {view === "overview" && (
                <>
                  <div className="gw-overview-grid">
                    <section className="gw-panel gw-balance gw-reveal">
                      <div className="gw-panel-title">
                        <span>WhatsApp click rate</span>
                        <MessageCircle size={17} aria-hidden="true" />
                      </div>
                      <strong className="gw-balance-value">{pct(c.clickers, c.visitors)}</strong>
                      <p className="gw-balance-meta">
                        {delta(c.visitors ? c.clickers / c.visitors : 0, p.visitors ? p.clickers / p.visitors : 0)} of visitors message you, vs the period before
                      </p>
                      <div className="gw-kpis">
                        <div>
                          <span>Visitors</span>
                          <strong>{fmt(c.visitors)}</strong>
                          {delta(c.visitors, p.visitors)}
                        </div>
                        <div>
                          <span>WhatsApp clicks</span>
                          <strong>{fmt(c.clicks)}</strong>
                          {delta(c.clicks, p.clicks)}
                        </div>
                        <div>
                          <span>Builder sends</span>
                          <strong>{fmt(c.builderSends)}</strong>
                          {delta(c.builderSends, p.builderSends)}
                        </div>
                        <div>
                          <span>Founding claims</span>
                          <strong>{fmt(c.foundingClaims)}</strong>
                          {delta(c.foundingClaims, p.foundingClaims)}
                        </div>
                      </div>
                      <div className="gw-account">
                        <span className="gw-account-icon">
                          <Users size={19} aria-hidden="true" />
                        </span>
                        <div>
                          <strong>{fmt(c.pageViews)} page views</strong>
                          <span>{c.visitors ? (c.pageViews / c.visitors).toFixed(1) : "–"} pages per visitor</span>
                        </div>
                        <button type="button" aria-label="See where visitors come from" onClick={() => setView("audience")}>
                          <ArrowRight size={20} aria-hidden="true" />
                        </button>
                      </div>
                    </section>
                    <section className="gw-panel gw-cashflow gw-reveal">
                      <div className="gw-panel-title">
                        <h2>Visitors and WhatsApp clicks</h2>
                        {periodSelector("Chart period")}
                      </div>
                      <div className="gw-chart-summary">
                        <div>
                          <span>
                            <i />
                            Visitors
                          </span>
                          <strong>{fmt(c.visitors)}</strong>
                        </div>
                        <div>
                          <span>
                            <i />
                            WhatsApp clicks
                          </span>
                          <strong>{fmt(c.clicks)}</strong>
                        </div>
                      </div>
                      {chart}
                    </section>
                  </div>
                  <div className="gw-lower-grid">
                    <section className="gw-panel gw-reveal">
                      <div className="gw-panel-title">
                        <h2>From visit to message</h2>
                        <span className="gw-small-label">{pct(f.clicked, f.visited)} sent a WhatsApp</span>
                      </div>
                      <div className="gw-funnel">
                        {funnelSteps.map((s, i) => (
                          <div key={s.label}>
                            <div>
                              <span>{s.label}</span>
                              {i > 0 && <em>{pct(s.n, funnelSteps[i - 1].n)} of previous</em>}
                              <strong>{fmt(s.n)}</strong>
                            </div>
                            <span className="gw-category-track">
                              <i style={{ width: `${f.visited ? (s.n / f.visited) * 100 : 0}%` }} />
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="gw-panel gw-reveal">
                      <div className="gw-panel-title">
                        <h2>What to improve</h2>
                        <button className="gw-text-button" type="button" onClick={() => setView("insights")}>
                          View all
                          <ArrowRight size={14} aria-hidden="true" />
                        </button>
                      </div>
                      {insightList(3)}
                    </section>
                  </div>
                </>
              )}

              {view === "leads" && (
                <>
                  <div className="gw-report-stats gw-reveal">
                    {[
                      { label: "WhatsApp clicks", value: fmt(c.clicks), note: delta(c.clicks, p.clicks) },
                      { label: "Visitors who messaged", value: fmt(c.clickers), note: <span>{pct(c.clickers, c.visitors)} of visitors</span> },
                      { label: "Founding-offer claims", value: fmt(c.foundingClaims), note: delta(c.foundingClaims, p.foundingClaims) },
                    ].map((s) => (
                      <section className="gw-panel" key={s.label}>
                        <div className="gw-panel-title">
                          <span>{s.label}</span>
                          <MessageCircle size={17} aria-hidden="true" />
                        </div>
                        <strong>{s.value}</strong>
                        <span>{s.note}</span>
                      </section>
                    ))}
                  </div>
                  <div className="gw-reports-grid">
                    <section className="gw-panel gw-reveal">
                      <div className="gw-panel-title">
                        <h2>Which button they tap</h2>
                        <span>All WhatsApp clicks</span>
                      </div>
                      {bars(d.clicksByButton, "No WhatsApp clicks in this period yet.")}
                    </section>
                    <div className="gw-stack">
                      <section className="gw-panel gw-reveal">
                        <div className="gw-panel-title">
                          <h2>Package asked about</h2>
                        </div>
                        {bars(d.clicksByPackage, "No package enquiries yet.")}
                      </section>
                      <section className="gw-panel gw-reveal">
                        <div className="gw-panel-title">
                          <h2>Care plan asked about</h2>
                        </div>
                        {bars(d.clicksByPlan, "No care plan enquiries yet.")}
                      </section>
                    </div>
                  </div>
                </>
              )}

              {view === "builder" && (
                <>
                  <div className="gw-report-stats gw-reveal">
                    {[
                      { label: "Opened the builder", value: fmt(f.openedBuilder), note: <span>{pct(f.openedBuilder, f.visited)} of visitors</span> },
                      { label: "Sent an estimate", value: fmt(c.builderSends), note: <span>{pct(f.sentBuilder, f.openedBuilder)} of builder visitors</span> },
                      { label: "Took the founding price", value: fmt(d.builderFounding), note: <span>of {fmt(c.builderSends)} sends</span> },
                    ].map((s) => (
                      <section className="gw-panel" key={s.label}>
                        <div className="gw-panel-title">
                          <span>{s.label}</span>
                          <Calculator size={17} aria-hidden="true" />
                        </div>
                        <strong>{s.value}</strong>
                        <span>{s.note}</span>
                      </section>
                    ))}
                  </div>
                  <div className="gw-reports-grid">
                    <section className="gw-panel gw-reveal">
                      <div className="gw-panel-title">
                        <h2>Estimate size sent</h2>
                        <span>No exact totals are stored</span>
                      </div>
                      {bars(d.builderBands, "No estimates sent yet.")}
                    </section>
                    <div className="gw-stack">
                      <section className="gw-panel gw-reveal">
                        <div className="gw-panel-title">
                          <h2>Package in the estimate</h2>
                        </div>
                        {bars(d.builderPackages, "No estimates sent yet.")}
                      </section>
                      <section className="gw-panel gw-reveal">
                        <div className="gw-panel-title">
                          <h2>Care plan chosen</h2>
                        </div>
                        {bars(d.builderCare, "No estimates sent yet.")}
                      </section>
                      <section className="gw-panel gw-reveal">
                        <div className="gw-panel-title">
                          <h2>Packages compared</h2>
                        </div>
                        {bars(d.pairs, "Nobody has used the comparison yet.")}
                      </section>
                    </div>
                  </div>
                </>
              )}

              {view === "audience" && (
                <>
                  <div className="gw-report-stats gw-reveal">
                    {d.locales.length ? (
                      d.locales.map((l) => (
                        <section className="gw-panel" key={l.locale}>
                          <div className="gw-panel-title">
                            <span>{nameOf(l.locale)} site</span>
                            <Globe size={17} aria-hidden="true" />
                          </div>
                          <strong>{fmt(l.visitors)}</strong>
                          <span>
                            visitors · {pct(l.clickers, l.visitors)} message you
                          </span>
                        </section>
                      ))
                    ) : (
                      <section className="gw-panel">
                        <strong>0</strong>
                        <span>No visitors yet</span>
                      </section>
                    )}
                  </div>
                  <div className="gw-reports-grid">
                    <section className="gw-panel gw-reveal">
                      <div className="gw-panel-title">
                        <h2>Where visitors come from</h2>
                        <span>Click rate per source</span>
                      </div>
                      {bars(withRate(d.sources), "No visitors yet.")}
                      {d.campaigns.length > 0 && (
                        <>
                          <h3 className="gw-subhead">Campaigns (utm_campaign)</h3>
                          {bars(d.campaigns, "")}
                        </>
                      )}
                    </section>
                    <div className="gw-stack">
                      <section className="gw-panel gw-reveal">
                        <div className="gw-panel-title">
                          <h2>Device</h2>
                        </div>
                        {bars(withRate(d.devices), "No visitors yet.")}
                      </section>
                      <section className="gw-panel gw-reveal">
                        <div className="gw-panel-title">
                          <h2>Location</h2>
                          <span>When the host provides it</span>
                        </div>
                        {bars(d.regions, "No location data yet.")}
                      </section>
                    </div>
                  </div>
                  <div className="gw-reports-grid gw-reveal">
                    <section className="gw-panel">
                      <div className="gw-panel-title">
                        <h2>How far people read</h2>
                        <span>Visitors who reached each section</span>
                      </div>
                      {bars(d.sections, "No scrolling recorded yet.")}
                    </section>
                    <section className="gw-panel">
                      <div className="gw-panel-title">
                        <h2>FAQ questions opened</h2>
                      </div>
                      {bars(d.faqs, "No FAQ cards opened yet.")}
                      <p className="gw-chart-footnote">
                        Language switches: {d.langSwitches.map((l) => `${fmt(l.n)} to ${nameOf(l.key)}`).join(", ") || "none"} · Offer bar closed: {fmt(d.offerCloses)}
                      </p>
                    </section>
                  </div>
                </>
              )}

              {view === "insights" && (
                <section className="gw-panel gw-reveal">
                  <div className="gw-panel-title">
                    <h2>What the numbers suggest</h2>
                    <span>Rules speak only with enough data (30+ visitors)</span>
                  </div>
                  {insightList()}
                  <p className="gw-chart-footnote">
                    Change one thing at a time, then compare this page a week or two later. Tag every link you share with ?utm_source=instagram (or the
                    channel) so sources show up here.
                  </p>
                </section>
              )}
            </div>

            <footer className="gw-footer">
              <span>
                <i />
                No cookies or personal data. Visitors are counted per day. Updated {generatedAt}. {fmt(d.totalEvents)} events stored.
              </span>
            </footer>
            <div className="gw-desktop-dock">{nav()}</div>
          </main>
        </div>

        {settingsOpen && (
          <aside className="gw-material gw-glass" id={`${id}-material`} aria-label="Glass appearance">
            <div className="gw-material-title">
              <div>
                <span className="gw-material-icon">
                  <Settings2 size={18} aria-hidden="true" />
                </span>
                <h2>Glass appearance</h2>
              </div>
              <button type="button" className="gw-icon-button" aria-label="Close glass settings" onClick={closeSettings}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p>Adjust the material across your dashboard. Saved in this browser.</p>
            <div className="gw-material-sample" aria-hidden="true">
              <ChartNoAxesCombined size={28} strokeWidth={1.1} />
              <span>Live material preview</span>
            </div>
            <div className="gw-presets" aria-label="Glass presets">
              {[
                { name: "Clear", value: { blur: 8, opacity: 0.14, saturation: 1.1, edge: 0.8 } },
                { name: "Frosted", value: defaults },
                { name: "Solid", value: { blur: 32, opacity: 0.86, saturation: 1, edge: 0.35 } },
              ].map((preset) => (
                <button key={preset.name} type="button" onClick={() => updateGlass(preset.value)}>
                  {preset.name}
                </button>
              ))}
            </div>
            {[
              { key: "blur", label: "Blur", min: 0, max: 40, step: 1, value: `${Math.round(material.blur)} px` },
              { key: "opacity", label: "Opacity", min: 0.08, max: 0.9, step: 0.01, value: `${Math.round(material.opacity * 100)}%` },
              { key: "saturation", label: "Saturation", min: 0.5, max: 2, step: 0.05, value: `${Math.round(material.saturation * 100)}%` },
              { key: "edge", label: "Edge light", min: 0, max: 1, step: 0.05, value: `${Math.round(material.edge * 100)}%` },
            ].map((ctl) => (
              <label className="gw-range" key={ctl.key}>
                <span>
                  {ctl.label}
                  <output>{ctl.value}</output>
                </span>
                <input
                  type="range"
                  aria-label={ctl.label}
                  min={ctl.min}
                  max={ctl.max}
                  step={ctl.step}
                  value={material[ctl.key as keyof GlassSettings]}
                  onChange={(e) => updateGlass({ [ctl.key]: Number(e.target.value) })}
                />
              </label>
            ))}
            <label className="gw-tint">
              Glass tint <input type="color" value={material.tint} onChange={(e) => updateGlass({ tint: e.target.value })} />
            </label>
            <button className="gw-reset" type="button" onClick={() => updateGlass(defaults)}>
              Reset appearance
            </button>
          </aside>
        )}
      </div>
      {notice && (
        <div className="gw-toast" role="status">
          <Check size={16} aria-hidden="true" />
          {notice}
        </div>
      )}
    </div>
  );
}

/* The design's stylesheet (21st.dev), trimmed to what this dashboard uses, set in the site's fonts and tokens. */
const styles = `
.gw-root {
  --gw-ink: var(--color-foreground);
  --gw-muted: var(--color-muted-foreground);
  --gw-accent: var(--color-accent);
  --gw-negative: var(--color-ochre-deep);
  --gw-line: color-mix(in srgb, var(--color-ink) 13%, transparent);
  --gw-surface: var(--color-card);
  --gw-panel: var(--color-card);
  --gw-brand: var(--color-ink);
  --gw-brand-ink: var(--color-surface);
  --gw-rail-active: color-mix(in srgb, var(--color-surface) 80%, transparent);
  --gw-soft: color-mix(in srgb, var(--color-sage-tint) 55%, transparent);
  --gw-segment: color-mix(in srgb, var(--color-ink) 7%, transparent);
  --gw-segment-active: color-mix(in srgb, var(--color-surface) 92%, transparent);
  --gw-dock: color-mix(in srgb, var(--color-surface) 62%, transparent);
  --gw-dock-active: var(--color-ink);
  --gw-dock-ink: var(--color-surface);
  --gw-button: var(--color-ink);
  --gw-button-ink: var(--color-surface);
  --gw-popover: color-mix(in srgb, var(--color-surface) 94%, transparent);
  --gw-fallback: var(--color-surface);
  --gw-shadow: rgb(23 33 27 / 0.2);
  --gw-panel-shadow: rgb(23 33 27 / 0.16);
  --gw-soft-shadow: rgb(23 33 27 / 0.08);
  --gw-hover: color-mix(in srgb, var(--color-surface) 45%, transparent);
  --gw-highlight: #ffffff;
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  overflow: hidden;
  padding: 38px 28px 32px;
  color: var(--gw-ink);
  font: 14px/1.5 var(--font-manrope), system-ui, sans-serif;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  color-scheme: light;
}
.gw-root * { box-sizing: border-box; }
.gw-root ::selection { background: var(--color-sage-tint); }
.gw-root button, .gw-root input, .gw-root a { font: inherit; color: inherit; }
.gw-root button { cursor: pointer; border: 0; background: none; }
.gw-root :focus-visible { outline: 2px solid var(--gw-accent); outline-offset: 3px; }
.gw-root h1, .gw-root h2, .gw-root h3, .gw-root p { margin: 0; }
/* palette backdrop in place of the design's photo: the glass needs colour behind it to read */
.gw-backdrop {
  position: absolute; inset: 0; z-index: -2;
  background:
    radial-gradient(60% 55% at 12% 8%, #b9c79e 0%, transparent 60%),
    radial-gradient(50% 50% at 92% 20%, #e3c88f 0%, transparent 62%),
    radial-gradient(70% 60% at 70% 100%, #587245 0%, transparent 60%),
    radial-gradient(55% 45% at 0% 90%, #dfe6cf 0%, transparent 70%),
    #eef1e4;
}
.gw-workspace { position: relative; width: min(1280px, 100%); margin: auto; }
.gw-glass {
  background: color-mix(in srgb, var(--gw-surface) calc(var(--gw-opacity) * 100%), transparent);
  backdrop-filter: blur(var(--gw-blur)) saturate(var(--gw-saturation));
  -webkit-backdrop-filter: blur(var(--gw-blur)) saturate(var(--gw-saturation));
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--gw-highlight) calc(var(--gw-edge) * 100%), transparent),
    inset 0 0 0 1px color-mix(in srgb, var(--gw-highlight) calc(var(--gw-edge) * 34%), transparent),
    0 20px 52px -25px var(--gw-shadow);
  position: relative;
}
.gw-glass:before { content: ""; position: absolute; inset: 0; background: var(--gw-tint); opacity: 0.12; pointer-events: none; border-radius: inherit; }
.gw-topbar { height: 62px; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-radius: 20px; margin-bottom: 18px; padding: 0 14px 0 20px; }
.gw-brand { display: flex; align-items: center; gap: 10px; white-space: nowrap; padding: 0; }
.gw-brand strong { font: 600 20px/1 var(--font-cormorant), Georgia, serif; }
.gw-brand-divider { height: 16px; width: 1px; background: var(--gw-line); margin: 0 4px; }
.gw-personal { font-size: 13px; color: var(--gw-muted); }
.gw-toolbar { display: flex; align-items: center; gap: 6px; }
.gw-toolbar form { display: contents; }
.gw-adjust { display: flex; align-items: center; gap: 8px; border-radius: 9px; padding: 0 12px; min-height: 40px; font-weight: 600; font-size: 13px; }
.gw-adjust:hover, .gw-icon-button:hover { background: var(--gw-hover); }
.gw-icon-button { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; flex: none; }
.gw-stage { display: flex; gap: 16px; align-items: flex-start; }
.gw-rail { border-radius: 23px; width: 52px; padding: 6px; display: flex; flex-direction: column; gap: 6px; margin-top: 50px; flex: none; }
.gw-rail button { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; }
.gw-rail button span { display: none; }
.gw-rail button[aria-current] { background: var(--gw-rail-active); box-shadow: 0 3px 8px var(--gw-soft-shadow); }
.gw-main { border-radius: 27px; padding: 30px 30px 98px; flex: 1; min-width: 0; }
.gw-view-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 28px; flex-wrap: wrap; }
.gw-greeting { font-size: 13px; color: var(--gw-muted); margin-bottom: 4px !important; }
.gw-view-heading h1 { font: 600 clamp(28px, 3vw, 40px)/1.1 var(--font-cormorant), Georgia, serif; letter-spacing: -0.01em; font-size-adjust: ex-height 0.44; }
.gw-heading-action { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.gw-panel {
  background: color-mix(in srgb, var(--gw-panel) calc((0.2 + var(--gw-opacity) * 0.5) * 100%), transparent);
  border-radius: 17px;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--gw-highlight) calc(var(--gw-edge) * 75%), transparent), 0 8px 22px -20px var(--gw-panel-shadow);
  padding: 21px; min-width: 0; position: relative;
}
.gw-panel-title { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; color: var(--gw-muted); font-size: 13px; }
.gw-panel-title h2 { font-size: 15px; font-weight: 700; color: var(--gw-ink); letter-spacing: -0.01em; }
.gw-panel-title > svg { opacity: 0.65; flex: none; }
.gw-overview-grid { display: grid; grid-template-columns: 0.9fr 1.5fr; gap: 16px; margin-bottom: 16px; }
.gw-balance { display: flex; flex-direction: column; }
.gw-balance-value { font: 600 clamp(44px, 4.6vw, 64px)/1 var(--font-cormorant), Georgia, serif; font-size-adjust: ex-height 0.44; letter-spacing: -0.02em; }
.gw-balance-meta { font-size: 13px; color: var(--gw-muted); margin-top: 10px !important; }
.gw-positive { color: var(--gw-accent); font-weight: 700; }
.gw-negative { color: var(--gw-negative); font-weight: 700; }
.gw-flat { color: var(--gw-muted); font-size: 12px; }
.gw-balance-meta .gw-positive, .gw-balance-meta .gw-negative { background: var(--gw-soft); border-radius: 5px; padding: 2px 6px; margin-right: 4px; }
.gw-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 18px; margin-top: 22px; }
.gw-kpis > div { display: flex; flex-direction: column; gap: 2px; }
.gw-kpis span:first-child { font-size: 12px; color: var(--gw-muted); }
.gw-kpis strong { font: 600 26px/1.1 var(--font-cormorant), Georgia, serif; font-size-adjust: ex-height 0.44; }
.gw-kpis > div > span:last-child { font-size: 12px; }
.gw-account { margin-top: auto; padding-top: 26px; display: flex; align-items: center; gap: 10px; }
.gw-account-icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 10px; background: var(--gw-soft); }
.gw-account > div { display: flex; flex-direction: column; }
.gw-account strong { font-weight: 700; font-size: 13px; }
.gw-account span { font-size: 12px; color: var(--gw-muted); }
.gw-account > button { margin-left: auto; width: 40px; height: 40px; border-radius: 50%; background: var(--gw-hover); display: grid; place-items: center; }
.gw-segment { display: flex; gap: 3px; background: var(--gw-segment); border-radius: 10px; padding: 3px; font-size: 12px; }
.gw-segment button { padding: 0 10px; min-height: 32px; border-radius: 8px; font-weight: 600; color: var(--gw-muted); white-space: nowrap; }
.gw-segment button[aria-pressed="true"] { background: var(--gw-segment-active); box-shadow: 0 2px 4px var(--gw-soft-shadow); color: var(--gw-ink); }
.gw-chart-summary { display: flex; gap: 34px; margin-bottom: 16px; }
.gw-chart-summary > div { display: flex; flex-direction: column; gap: 2px; }
.gw-chart-summary span { font-size: 12px; color: var(--gw-muted); display: flex; align-items: center; gap: 6px; }
.gw-chart-summary i { width: 8px; height: 8px; background: var(--gw-accent); border-radius: 50%; }
.gw-chart-summary > div + div i { background: var(--gw-ink); }
.gw-chart-summary strong { font: 600 28px/1.1 var(--font-cormorant), Georgia, serif; font-size-adjust: ex-height 0.44; }
.gw-chart-wrap { position: relative; padding-left: 36px; padding-top: 2px; }
.gw-chart-wrap svg { display: block; width: 100%; height: 150px; overflow: visible; }
.gw-chart-labels { position: absolute; left: 0; top: 6px; bottom: 22px; display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; color: var(--gw-muted); }
.gw-chart-months { position: relative; height: 26px; font-size: 11px; color: var(--gw-muted); padding-top: 10px; }
.gw-chart-months > span { position: absolute; white-space: nowrap; }
.gw-lower-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 16px; }
.gw-small-label { font-size: 12px; }
.gw-text-button { display: flex; align-items: center; gap: 6px; font-size: 13px !important; font-weight: 600; min-height: 32px; }
.gw-text-button:hover { color: var(--gw-accent); }
.gw-category-list > div + div, .gw-funnel > div + div { margin-top: 16px; }
.gw-category-list > div > div, .gw-funnel > div > div { display: flex; gap: 8px; align-items: baseline; font-size: 13px; }
.gw-category-list em, .gw-funnel em { font-style: normal; font-size: 12px; color: var(--gw-muted); }
.gw-category-list strong, .gw-funnel strong { margin-left: auto; font-weight: 700; }
.gw-category-track { display: block; height: 6px; border-radius: 4px; background: var(--gw-line); margin-top: 8px; overflow: hidden; }
.gw-category-track i { display: block; height: 100%; background: var(--gw-accent); border-radius: 4px; }
.gw-subhead { font-size: 13px; font-weight: 700; margin: 22px 0 12px !important; }
.gw-insights { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.gw-insights li { display: flex; gap: 12px; padding: 12px; border-radius: 12px; background: color-mix(in srgb, var(--color-surface) 45%, transparent); }
.gw-insights li[data-tone="act"] { background: color-mix(in srgb, var(--color-ochre-wash) 70%, transparent); }
.gw-insights li[data-tone="good"] { background: color-mix(in srgb, var(--color-sage-tint) 55%, transparent); }
.gw-insight-icon { flex: none; width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; background: var(--gw-soft); color: var(--gw-ink); }
.gw-insights li[data-tone="act"] .gw-insight-icon { color: var(--gw-negative); }
.gw-insights strong { display: block; font-size: 14px; font-weight: 700; line-height: 1.35; }
.gw-insights p { font-size: 13px; color: var(--gw-muted); margin-top: 3px !important; }
.gw-footer { display: flex; align-items: center; color: var(--gw-muted); font-size: 12px; margin-top: 22px; }
.gw-footer > span { display: flex; align-items: center; gap: 8px; }
.gw-footer i { height: 6px; width: 6px; flex: none; background: var(--gw-accent); border-radius: 50%; }
.gw-desktop-dock { position: absolute; bottom: 19px; left: 50%; transform: translateX(-50%); }
.gw-dock { display: flex; align-items: center; gap: 3px; border-radius: 30px; padding: 5px; white-space: nowrap; background: var(--gw-dock); backdrop-filter: blur(20px); }
.gw-dock button { display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 24px; padding: 0 16px; min-height: 40px; font-size: 13px; font-weight: 600; transition: background 0.22s, color 0.22s; }
.gw-dock button svg { width: 16px; }
.gw-dock button[aria-current] { background: var(--gw-dock-active); color: var(--gw-dock-ink); box-shadow: 0 3px 7px var(--gw-soft-shadow); }
.gw-dock button:not([aria-current]):hover { background: var(--gw-hover); }
.gw-mobile-nav { display: none; }
.gw-button { padding: 0 14px; min-height: 38px; border-radius: 10px; display: flex; align-items: center; gap: 7px; background: var(--gw-button) !important; color: var(--gw-button-ink) !important; font-size: 13px !important; font-weight: 700; white-space: nowrap; }
.gw-button:hover { filter: brightness(1.15); }
.gw-empty { text-align: center; padding: 50px 15px; color: var(--gw-muted); font-size: 13px; }
.gw-empty-small { padding: 18px 0; text-align: start; }
.gw-empty svg { margin-bottom: 12px; }
.gw-empty h3 { font-size: 16px; color: var(--gw-ink); margin-bottom: 6px; }
.gw-chart-empty { padding: 30px 15px; min-height: 160px; }
.gw-report-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.gw-report-stats strong { font: 600 38px/1.1 var(--font-cormorant), Georgia, serif; font-size-adjust: ex-height 0.44; display: block; }
.gw-report-stats section > span { font-size: 12px; color: var(--gw-muted); }
.gw-report-stats .gw-panel-title { margin-bottom: 12px; }
.gw-reports-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; margin-bottom: 16px; }
.gw-stack { display: grid; gap: 16px; align-content: start; }
.gw-chart-footnote { font-size: 12px; color: var(--gw-muted); margin-top: 16px !important; }
.gw-material {
  position: absolute; z-index: 20; max-height: calc(100svh - 128px); overflow: auto; right: 10px; top: 75px; width: 300px;
  border-radius: 22px; padding: 22px; background: var(--gw-popover); box-shadow: inset 0 1px 0 #fff8, 0 24px 80px rgb(23 33 27 / 0.2);
}
.gw-material-title { display: flex; align-items: center; justify-content: space-between; }
.gw-material-title > div { display: flex; gap: 10px; align-items: center; }
.gw-material h2 { font-size: 17px; font-weight: 700; }
.gw-material-icon { display: grid; place-items: center; }
.gw-material > p { font-size: 12px; color: var(--gw-muted); margin: 7px 0 18px; }
.gw-material-sample {
  height: 87px; display: flex; align-items: center; justify-content: center; gap: 12px; border-radius: 13px; margin-bottom: 17px;
  background: color-mix(in srgb, var(--gw-tint) calc(var(--gw-opacity) * 100%), transparent); backdrop-filter: blur(var(--gw-blur));
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--gw-highlight) calc(var(--gw-edge) * 100%), transparent), 0 12px 20px -18px rgb(23 33 27 / 0.5);
  font-size: 13px;
}
.gw-presets { display: flex; gap: 5px; margin-bottom: 20px; }
.gw-presets button { flex: 1; border: 1px solid var(--gw-line); border-radius: 8px; min-height: 36px; font-size: 13px; }
.gw-presets button:hover, .gw-reset:hover { background: var(--gw-hover); }
.gw-range { display: block; margin: 17px 0; }
.gw-range > span { display: flex; justify-content: space-between; font-size: 13px; }
.gw-range output { font-size: 12px; color: var(--gw-muted); }
.gw-range input { width: 100%; accent-color: var(--gw-accent); height: 16px; margin: 8px 0 0; cursor: pointer; }
.gw-tint { display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-top: 20px; }
.gw-tint input { height: 30px; width: 44px; padding: 2px; background: none; border: 1px solid var(--gw-line); border-radius: 6px; cursor: pointer; }
.gw-reset { width: 100%; border: 1px solid var(--gw-line) !important; border-radius: 8px; min-height: 40px; margin-top: 22px; font-size: 13px !important; }
.gw-toast { position: fixed; left: 50%; bottom: 25px; transform: translateX(-50%); z-index: 30; display: flex; align-items: center; gap: 10px; padding: 13px 20px; border-radius: 12px; background: var(--color-ink); color: var(--color-surface); box-shadow: 0 10px 30px rgb(23 33 27 / 0.15); font-size: 13px; white-space: nowrap; }
@supports not (backdrop-filter: blur(1px)) { .gw-glass, .gw-panel { background: var(--gw-fallback); } }
@media (max-width: 1050px) {
  .gw-root { padding: 24px 18px; }
  .gw-main { padding: 25px 23px 92px; }
  .gw-rail { display: none; }
  .gw-overview-grid, .gw-lower-grid, .gw-reports-grid { grid-template-columns: 1fr; }
}
@media (max-width: 700px) {
  .gw-root { padding: 12px 10px 24px; }
  .gw-topbar { height: 56px; padding: 0 8px 0 12px; border-radius: 17px; margin-bottom: 12px; }
  .gw-brand-divider, .gw-personal, .gw-adjust span { display: none; }
  .gw-main { border-radius: 20px; padding: 22px 14px 26px; }
  .gw-view-heading { margin-bottom: 18px; }
  .gw-mobile-nav { display: block; margin-bottom: 18px; overflow-x: auto; scrollbar-width: none; }
  .gw-mobile-nav .gw-dock { width: max-content; min-width: 100%; padding: 4px; border-radius: 12px; justify-content: space-between; box-shadow: none; }
  .gw-dock button { padding: 0 10px; border-radius: 9px; font-size: 12px; gap: 5px; }
  .gw-desktop-dock { display: none; }
  .gw-overview-grid, .gw-lower-grid, .gw-reports-grid, .gw-report-stats { grid-template-columns: 1fr; gap: 12px; }
  .gw-panel { border-radius: 15px; padding: 17px; }
  .gw-chart-summary { gap: 24px; }
  .gw-cashflow .gw-segment { display: none; } /* the heading has the same period switch */
  .gw-material { right: 4px; top: 65px; width: min(310px, calc(100% - 8px)); padding: 20px; max-height: calc(100svh - 90px); }
  .gw-toast { max-width: calc(100% - 30px); white-space: normal; }
}
@media (prefers-reduced-motion: reduce) { .gw-root * { scroll-behavior: auto !important; transition: none !important; } }
`;
