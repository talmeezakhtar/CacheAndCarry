"use client";

/*
 * Two-plan diff pricing table, adapted for Cache & Carry. Changes from the original:
 * - prices format with thousands separators and an optional "from" (AED 2,499, "from AED 2,499")
 * - reading sizes from DESIGN.md (14px rows, 12px labels) instead of 10-12px text
 * - a flat summary band instead of a decorative gradient; classes merged with cn() so className can override
 * - shadcn tokens (foreground, muted, chart-1..5 …) are mapped to the site palette in app/globals.css
 */

import * as React from "react";
import { ArrowLeftRight, Check, ChevronDown, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type DiffValue = boolean | number | string;

export type DiffPlan = {
  id: string;
  name: string;
  /** Price as a number so the table can report the difference. */
  price: number;
  currency?: string;
  interval?: string;
  /** Show the price as a starting price ("from AED 2,499"). */
  from?: boolean;
  badge?: string;
  actionLabel?: string;
};

export type DiffFeature = {
  id: string;
  label: string;
  values: { [planId: string]: DiffValue };
  /** Explicit order from worst to best. Use it when values are words or mix units. */
  rank?: DiffValue[];
  /** Numbers are better when higher unless a feature says otherwise (for example, latency). */
  better?: "higher" | "lower";
};

export type DiffGroup = {
  id: string;
  label: string;
  features: DiffFeature[];
};

type SectionProps = React.ComponentProps<"section">;

export type DiffPair = [string, string];
export type DiffVerdict = "gain" | "loss" | "changed" | "same";

export type TwoPlanDiffPricingTableProps = {
  plans: DiffPlan[];
  groups: DiffGroup[];
  pair?: DiffPair;
  defaultPair?: DiffPair;
  onPairChange?: (pair: DiffPair) => void;
  showSame?: boolean;
  defaultShowSame?: boolean;
  onShowSameChange?: (value: boolean) => void;
  onChoosePlan?: (plan: DiffPlan) => void;
  /** Presentation loop through pairs. Any click or key press stops it. */
  autoplay?: boolean;
  autoplayPairs?: DiffPair[];
  autoplayInterval?: number;
  labels?: {
    picker?: string;
    swap?: string;
    gain?: string;
    loss?: string;
    changed?: string;
    same?: string;
    showSame?: string;
    hideSame?: string;
    feature?: string;
    keep?: (plan: DiffPlan) => string;
    summary?: (from: DiffPlan, to: DiffPlan, delta: number, gains: number, losses: number) => string;
  };
  className?: string;
  ref?: SectionProps["ref"];
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const media = matchMedia(REDUCED);
  media.addEventListener("change", cb);
  return () => media.removeEventListener("change", cb);
};

function score(feature: DiffFeature, value: DiffValue): number {
  if (feature.rank) {
    const index = feature.rank.findIndex((entry) => Object.is(entry, value));
    return index < 0 ? Number.NaN : index;
  }
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value;
  if (/unlimited|∞|no limit/i.test(value)) return Number.POSITIVE_INFINITY;
  const match = /-?\d[\d,]*(?:\.\d+)?/.exec(value);
  return match ? Number.parseFloat(match[0].replace(/,/g, "")) : Number.NaN;
}

export function verdictFor(feature: DiffFeature, fromId: string, toId: string): DiffVerdict {
  const from = feature.values[fromId];
  const to = feature.values[toId];
  if (Object.is(from, to)) return "same";
  if (from === undefined || to === undefined) return "changed";
  const a = score(feature, from);
  const b = score(feature, to);
  if (Number.isNaN(a) || Number.isNaN(b) || a === b) return "changed";
  const higherWins = feature.better !== "lower";
  return (b > a) === higherWins ? "gain" : "loss";
}

export function formatPrice(plan: DiffPlan) {
  return `${plan.from ? "from " : ""}${plan.currency ?? "$"}${plan.price.toLocaleString("en-US")}${plan.interval ?? "/mo"}`;
}

function ValueCell({ value, verdict, side }: { value: DiffValue | undefined; verdict: DiffVerdict; side: "from" | "to" }) {
  const emphasis =
    side === "to" && verdict === "gain"
      ? "font-bold text-foreground"
      : side === "to" && verdict === "loss"
        ? "text-muted-foreground line-through decoration-chart-5/60"
        : "text-muted-foreground";
  if (typeof value === "boolean") {
    return (
      <span className={`inline-flex items-center gap-1.5 ${emphasis}`}>
        <span
          className={`flex size-5 items-center justify-center rounded-full ${value ? "bg-chart-2 text-background" : "bg-muted text-muted-foreground"}`}
          aria-hidden="true"
        >
          {value ? <Check className="size-3" strokeWidth={3} /> : <Minus className="size-3" strokeWidth={3} />}
        </span>
        <span className="sr-only">{value ? "Included" : "Not included"}</span>
      </span>
    );
  }
  return <span className={emphasis}>{value === undefined ? "—" : String(value)}</span>;
}

export function TwoPlanDiffPricingTable({
  plans,
  groups,
  pair,
  defaultPair,
  onPairChange,
  showSame,
  defaultShowSame = false,
  onShowSameChange,
  onChoosePlan,
  autoplay = false,
  autoplayPairs,
  autoplayInterval = 2400,
  labels = {},
  className = "",
  ref,
}: TwoPlanDiffPricingTableProps) {
  const fallback: DiffPair = [plans[0]?.id ?? "", plans[1]?.id ?? plans[0]?.id ?? ""];
  const [localPair, setLocalPair] = React.useState((defaultPair ?? fallback) as DiffPair);
  const [localShowSame, setLocalShowSame] = React.useState(defaultShowSame);
  // Reduced motion until the browser says otherwise (the server snapshot), so nothing animates before hydration.
  const reduced = React.useSyncExternalStore(subscribeReduced, () => matchMedia(REDUCED).matches, () => true);
  const [paused, setPaused] = React.useState(false);
  const order = React.useRef([] as string[]);
  const rows = React.useRef({} as { [id: string]: HTMLTableRowElement });
  const previousRects = React.useRef({} as { [id: string]: DOMRect });
  const previousPair = React.useRef("");
  const summaryRef = React.useRef(null as HTMLParagraphElement | null);
  const animations = React.useRef([] as Animation[]);
  const headingId = React.useId();

  const candidate = pair ?? localPair;
  const valid = plans.length >= 2 && candidate[0] !== candidate[1] && candidate.every((id) => plans.some((plan) => plan.id === id));
  const activePair: DiffPair = valid ? candidate : fallback;
  const from = plans.find((plan) => plan.id === activePair[0]) ?? plans[0]!;
  const to = plans.find((plan) => plan.id === activePair[1]) ?? plans[1] ?? plans[0]!;
  const sameVisible = showSame ?? localShowSame;

  const sections = React.useMemo(() => {
    const buckets = { gain: [] as DiffFeature[], loss: [] as DiffFeature[], changed: [] as DiffFeature[], same: [] as DiffFeature[] };
    for (const group of groups) for (const feature of group.features) buckets[verdictFor(feature, from.id, to.id)].push(feature);
    return buckets;
  }, [groups, from.id, to.id]);
  const delta = to.price - from.price;
  const summaryText = labels.summary
    ? labels.summary(from, to, delta, sections.gain.length, sections.loss.length)
    : `${to.name} ${delta >= 0 ? "adds" : "saves"} ${from.currency ?? "$"}${Math.abs(delta).toLocaleString("en-US")}${from.interval ?? "/mo"} · ${sections.gain.length} ${labels.gain ?? "upgrades"} · ${sections.loss.length} ${labels.loss ?? "downgrades"}`;

  const commitPair = React.useCallback(
    (next: DiffPair) => {
      if (pair === undefined) setLocalPair(next);
      onPairChange?.(next);
    },
    [pair, onPairChange],
  );

  const toggleSame = (value: boolean) => {
    if (showSame === undefined) setLocalShowSame(value);
    onShowSameChange?.(value);
  };

  // The least recently picked slot is the one a new plan replaces.
  const pick = (id: string) => {
    setPaused(true);
    if (id === activePair[0] || id === activePair[1]) return;
    const slot = order.current[0] === "to" ? "to" : "from";
    const next: DiffPair = slot === "from" ? [id, activePair[1]] : [activePair[0], id];
    order.current = slot === "from" ? ["to", "from"] : ["from", "to"];
    commitPair(next);
  };

  const swap = () => {
    setPaused(true);
    commitPair([activePair[1], activePair[0]]);
  };

  // Rows move between the gain, loss and same sections; FLIP keeps them visually continuous.
  React.useLayoutEffect(() => {
    const key = activePair.join("→");
    const before = previousRects.current;
    const after = {} as { [id: string]: DOMRect };
    for (const [id, row] of Object.entries(rows.current)) after[id] = row.getBoundingClientRect();
    const changed = previousPair.current !== "" && previousPair.current !== key;
    previousPair.current = key;
    previousRects.current = after;
    if (!changed || reduced) return;
    for (const animation of animations.current) animation.cancel();
    animations.current = [];
    for (const [id, row] of Object.entries(rows.current)) {
      const start = before[id];
      const end = after[id];
      if (!start || !end) {
        animations.current.push(row.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 360, easing: EASE }));
        continue;
      }
      const dy = start.top - end.top;
      if (Math.abs(dy) > 1) animations.current.push(row.animate([{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }], { duration: 480, easing: EASE }));
      const cell = row.querySelector("[data-side='to']");
      if (cell instanceof HTMLElement) animations.current.push(cell.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 640, easing: "ease-out" }));
    }
    const summary = summaryRef.current;
    if (summary) animations.current.push(summary.animate([{ opacity: 0.2, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 360, easing: EASE }));
  }, [activePair, sameVisible, reduced]);

  React.useEffect(
    () => () => {
      for (const animation of animations.current) animation.cancel();
    },
    [],
  );

  const presets = React.useMemo(() => {
    if (autoplayPairs && autoplayPairs.length) return autoplayPairs;
    const ids = plans.map((plan) => plan.id);
    const list: DiffPair[] = [];
    for (let index = 0; index + 1 < ids.length; index += 1) list.push([ids[index]!, ids[index + 1]!]);
    return list;
  }, [autoplayPairs, plans]);

  React.useEffect(() => {
    if (!autoplay || reduced || paused || presets.length < 2) return;
    let step = presets.findIndex((entry) => entry[0] === activePair[0] && entry[1] === activePair[1]);
    const timer = window.setInterval(() => {
      step = (step + 1) % presets.length;
      commitPair(presets[step]!);
    }, autoplayInterval);
    return () => window.clearInterval(timer);
    // Restarting on every pair change would reset the interval; the step index tracks it instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced, paused, presets, autoplayInterval, commitPair]);

  const registerRow = (id: string) => (node: HTMLTableRowElement | null) => {
    if (node) rows.current[id] = node;
    else delete rows.current[id];
  };

  const renderRows = (verdict: DiffVerdict, list: DiffFeature[]) =>
    list.map((feature) => (
      <tr key={feature.id} ref={registerRow(feature.id)} data-feature={feature.id} data-verdict={verdict} className="border-t border-border">
        <th scope="row" className="py-3 pl-4 pr-2 text-left text-sm font-bold text-foreground sm:pl-5">
          {feature.label}
        </th>
        <td data-side="from" className="px-3 py-3 text-center text-sm">
          <ValueCell value={feature.values[from.id]} verdict={verdict} side="from" />
        </td>
        <td
          data-side="to"
          className={`relative py-3 pl-3 pr-10 text-center text-sm ${verdict === "gain" ? "bg-chart-2/10" : verdict === "loss" ? "bg-chart-5/10" : ""}`}
        >
          <ValueCell value={feature.values[to.id]} verdict={verdict} side="to" />
          {verdict === "gain" && (
            <span className="absolute right-3 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-chart-2 text-background" aria-label="Upgrade">
              <Plus className="size-3" strokeWidth={3} />
            </span>
          )}
          {verdict === "loss" && (
            <span className="absolute right-3 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-chart-5 text-background" aria-label="Downgrade">
              <Minus className="size-3" strokeWidth={3} />
            </span>
          )}
        </td>
      </tr>
    ));

  const sectionRow = (verdict: DiffVerdict, label: string, count: number) =>
    count > 0 && (
      <tr key={`section-${verdict}`} data-section={verdict} className="bg-muted/60">
        <th
          scope="rowgroup"
          colSpan={3}
          className={`px-4 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] sm:px-5 ${verdict === "gain" ? "text-chart-2" : verdict === "loss" ? "text-chart-5" : "text-muted-foreground"}`}
        >
          {label} · {count}
        </th>
      </tr>
    );

  return (
    <section
      ref={ref}
      data-slot="two-plan-diff-pricing-table"
      data-pair={activePair.join(",")}
      aria-labelledby={headingId}
      onKeyDownCapture={() => setPaused(true)}
      className={cn("w-full max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card text-card-foreground", className)}
    >
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={labels.picker ?? "Choose two plans to compare"}>
          {plans.map((plan) => {
            const role = plan.id === activePair[0] ? "A" : plan.id === activePair[1] ? "B" : null;
            return (
              <button
                key={plan.id}
                type="button"
                data-plan-chip={plan.id}
                data-role={role ?? undefined}
                aria-pressed={role !== null}
                onClick={() => pick(plan.id)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-bold outline-none transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring ${
                  role === "A"
                    ? "border-chart-3/50 bg-chart-3/15 text-foreground"
                    : role === "B"
                      ? "border-chart-1/50 bg-chart-1/15 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {role && (
                  <span className={`flex size-5 items-center justify-center rounded-full text-xs font-bold text-background ${role === "A" ? "bg-chart-3" : "bg-chart-1"}`}>
                    {role}
                  </span>
                )}
                {plan.name}
                <span className="text-xs font-normal tabular-nums text-muted-foreground">{formatPrice(plan)}</span>
              </button>
            );
          })}
          <button
            type="button"
            data-swap
            onClick={swap}
            aria-label={labels.swap ?? "Swap plans"}
            className="ml-auto inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground outline-none transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeftRight className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p ref={summaryRef} id={headingId} data-summary role="status" aria-live="polite" className="rounded-xl bg-muted px-4 py-3 text-sm font-bold text-foreground">
          <span className="font-normal text-muted-foreground">{from.name} → </span>
          {summaryText}
        </p>
      </div>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-t border-border">
            <th scope="col" className="py-2.5 pl-4 pr-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground sm:pl-5">
              {labels.feature ?? "Feature"}
            </th>
            <th scope="col" data-head="from" className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <span className="mr-1.5 inline-flex size-4 items-center justify-center rounded-full bg-chart-3 text-[10px] font-bold text-background">A</span>
              {from.name}
            </th>
            <th scope="col" data-head="to" className="py-2.5 pl-3 pr-10 text-center text-xs font-bold uppercase tracking-[0.12em] text-foreground">
              <span className="mr-1.5 inline-flex size-4 items-center justify-center rounded-full bg-chart-1 text-[10px] font-bold text-background">B</span>
              {to.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {sectionRow("gain", labels.gain ? `You gain · ${labels.gain}` : "You gain", sections.gain.length)}
          {renderRows("gain", sections.gain)}
          {sectionRow("loss", "You lose", sections.loss.length)}
          {renderRows("loss", sections.loss)}
          {sectionRow("changed", labels.changed ?? "Different", sections.changed.length)}
          {renderRows("changed", sections.changed)}
          {sections.same.length > 0 && (
            <tr data-section="same" className="bg-muted/60">
              <th scope="rowgroup" colSpan={3} className="px-2 py-1 text-left sm:px-3">
                <button
                  type="button"
                  data-toggle-same
                  aria-expanded={sameVisible}
                  onClick={() => {
                    setPaused(true);
                    toggleSame(!sameVisible);
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronDown className={`size-3.5 transition-transform motion-reduce:transition-none ${sameVisible ? "rotate-180" : ""}`} aria-hidden="true" />
                  {sameVisible ? (labels.hideSame ?? "Hide same") : (labels.showSame ?? "Show same")} · {sections.same.length}
                </button>
              </th>
            </tr>
          )}
          {sameVisible && renderRows("same", sections.same)}
        </tbody>
      </table>
      {onChoosePlan && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4 sm:px-5">
          <button
            type="button"
            data-choose="from"
            onClick={() => onChoosePlan(from)}
            className="inline-flex min-h-11 items-center rounded-full border border-foreground px-5 text-sm font-bold text-foreground outline-none transition-colors motion-reduce:transition-none hover:bg-foreground hover:text-background focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            {labels.keep ? labels.keep(from) : `Keep ${from.name}`}
          </button>
          <button
            type="button"
            data-choose="to"
            onClick={() => onChoosePlan(to)}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground outline-none transition-colors motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98]"
          >
            {to.actionLabel ?? `Switch to ${to.name}`}
          </button>
        </div>
      )}
    </section>
  );
}

export default TwoPlanDiffPricingTable;
