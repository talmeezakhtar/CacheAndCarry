"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Pricing 6, adapted for Cache & Carry. Changes from the original:
 * - site palettes (sage, olive, ochre) instead of blue/purple/amber/teal/rose/slate, no dark: variants
 * - lucide's Check instead of Hugeicons, and a plain link instead of the shadcn Button (no new packages)
 * - the two tabs are generic (here: Monthly and Yearly) and both plan sets are required props
 * - CTAs open in a new tab when they leave the site (WhatsApp)
 * - no blurred colour blobs or avatar orb: decoration without meaning (audit, DESIGN.md)
 */

type Palette6 = "sage" | "olive" | "ochre";

export type Plan6 = {
  id: string;
  name: string;
  description: string;
  palette: Palette6;
  price: string;
  originalPrice?: string;
  priceNote?: string;
  ctaLabel: string;
  ctaHref: string;
  featuredLabel?: string;
  features: string[];
  footerNote?: string;
  footerDesc?: string;
  ctaDark?: boolean;
};

const CARD_PALETTES: Record<Palette6, { base: string }> = {
  sage: { base: "bg-sage-wash" },
  olive: { base: "bg-sage-soft" },
  ochre: { base: "bg-ochre-wash" },
};

function PlanCard({ plan }: { plan: Plan6 }) {
  const pal = CARD_PALETTES[plan.palette];
  const external = /^https?:/.test(plan.ctaHref);

  return (
    <article className="flex flex-col rounded-2xl border border-line bg-surface p-1">
      <div className={cn("relative overflow-hidden rounded-xl border border-ink/5 p-5", pal.base)}>
        {/* paper grain only: the tinted card carries the plan's colour, no decorative blobs */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.4] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
          <filter id={`grain-${plan.id}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-${plan.id})`} />
        </svg>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h4 className="font-heading text-2xl">{plan.name}</h4>
              {plan.featuredLabel && <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-xs font-bold text-ink">{plan.featuredLabel}</span>}
            </div>
            <p className="text-sm text-ink/80">{plan.description}</p>
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-heading text-3xl">{plan.price}</span>
              {plan.originalPrice && (
                <span className="text-base text-ink/70 line-through">
                  <span className="sr-only">instead of </span>
                  {plan.originalPrice}
                </span>
              )}
            </div>
            {plan.priceNote && <p className="text-sm text-ink/80">{plan.priceNote}</p>}
          </div>

          <a
            href={plan.ctaHref}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-center rounded-full px-4 font-bold transition-colors active:scale-[0.98]",
              plan.ctaDark ? "bg-ink text-surface hover:bg-ink/85" : "bg-surface/80 text-ink backdrop-blur-sm hover:bg-surface",
            )}
          >
            {plan.ctaLabel}
          </a>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-2 pt-5">
        <ul className="space-y-2.5">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.5} />
              {f}
            </li>
          ))}
        </ul>

        {(plan.footerNote || plan.footerDesc) && (
          <div className="mt-auto space-y-0.5 border-t border-line px-1 py-3">
            {plan.footerNote && <p className="text-sm font-bold">{plan.footerNote}</p>}
            {plan.footerDesc && <p className="text-sm text-ink/80">{plan.footerDesc}</p>}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Pricing6({
  firstPlans,
  secondPlans,
  firstLabel,
  secondLabel,
  title,
  subtitle,
}: {
  firstPlans: Plan6[];
  secondPlans: Plan6[];
  firstLabel: string;
  secondLabel: string;
  title: string;
  subtitle?: string;
}) {
  const [second, setSecond] = useState(false);
  const plans = second ? secondPlans : firstPlans;

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h3 className="font-heading text-3xl">{title}</h3>
          {subtitle && <p className="text-ink/80">{subtitle}</p>}
        </div>
        <div role="group" aria-label="Billing" className="flex items-center gap-0.5 self-start rounded-full border border-line bg-surface p-1 sm:self-auto">
          {[firstLabel, secondLabel].map((label, i) => {
            const on = (i === 1) === second;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => setSecond(i === 1)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm font-bold transition-colors duration-200",
                  on ? "bg-ink text-surface" : "text-ink/80 hover:text-ink",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
