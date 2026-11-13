"use client";

import { TwoPlanDiffPricingTable, type DiffGroup, type DiffPlan } from "@/components/ui/two-plan-diff-pricing-table";
import { addOns, included, packages, paymentTerms, site } from "@/lib/site";
import { QUOTE_THRESHOLD, aed } from "@/lib/quote";
import { PICK_PACKAGE, type PickPackage } from "@/components/price-builder";

/*
 * "Compare two packages": pick any two of the four build packages and see only what changes between them.
 * Every value comes from lib/site.ts with the same rule as the builder: a feature is included only when the
 * package lists it, otherwise it shows its add-on price. The buttons hand the package to the builder below.
 */

type Pkg = (typeof packages)[number];
const id = (p: Pkg) => p.label.toLowerCase();
const has = (p: Pkg, item: string) => (p.items as readonly string[]).includes(item);
const addOn = (label: string) => `Add-on, ${aed(addOns.find((a) => a.label === label)?.price ?? null)}`;
/** Included beats an add-on; the rank tells the table which way is an upgrade. */
const extra = (label: string) => ({
  values: Object.fromEntries(packages.map((p) => [id(p), has(p, label) ? true : addOn(label)])),
  rank: [addOn(label), true],
});

const plans: DiffPlan[] = packages.map((p) => ({
  id: id(p),
  name: p.label,
  price: p.price,
  currency: "AED ",
  interval: "",
  from: "from" in p && p.from,
  actionLabel: `Estimate with ${p.label}`,
}));

const groups: DiffGroup[] = [
  {
    id: "site",
    label: "Your site",
    features: [
      {
        id: "size",
        label: "Size",
        values: { starter: "1 page", business: "Up to 4 pages", pro: "Up to 7 pages", store: "Online shop" },
        rank: ["1 page", "Up to 4 pages", "Up to 7 pages"],
      },
      { id: "shop", label: "Online shop and payments", values: Object.fromEntries(packages.map((p) => [id(p), id(p) === "store"])) },
      { id: "products", label: "Products", values: Object.fromEntries(packages.map((p) => [id(p), id(p) === "store" ? "Up to 20" : false])) },
      { id: "form", label: "Custom enquiry form", values: Object.fromEntries(packages.map((p) => [id(p), id(p) === "pro"])) },
    ],
  },
  {
    id: "google",
    label: "Google",
    features: [
      { id: "seo", label: "Basic SEO setup", ...extra("Basic SEO setup") },
      { id: "gbp", label: "Google Business Profile setup", ...extra("Google Business Profile setup") },
    ],
  },
  {
    id: "terms",
    label: "Terms",
    features: [
      {
        id: "pay",
        label: "How you pay",
        values: Object.fromEntries(packages.map((p) => [id(p), p.price > QUOTE_THRESHOLD ? "Written quote, then 50/50" : paymentTerms(p.label).replace("50% to start, 50% before go-live", "50/50")])),
      },
      { id: "live", label: "Goes live", values: Object.fromEntries(packages.map((p) => [id(p), id(p) === "starter" ? site.delivery : "Date in your quote"])) },
    ],
  },
  {
    // The same in every package, so these sit under "Show same".
    id: "every",
    label: "Every package",
    features: included.map((item) => ({ id: item, label: item.replace(/^./, (c) => c.toUpperCase()), values: Object.fromEntries(packages.map((p) => [id(p), true])) })),
  },
];

/** Starter and Business are priced in the builder; Pro and Store open its "Bigger site" choice. */
const builderKey = (planId: string): PickPackage => (planId === "starter" ? "Starter" : planId === "business" ? "Business" : "Quote");

export function PackageDiff() {
  return (
    <TwoPlanDiffPricingTable
      plans={plans}
      groups={groups}
      defaultPair={["starter", "business"]}
      className="max-w-none"
      labels={{
        picker: "Choose two packages to compare",
        swap: "Swap the two packages",
        feature: "What you get",
        changed: "Different",
        showSame: "Same in both",
        hideSame: "Hide what's the same",
        keep: (p) => `Estimate with ${p.name}`,
        summary: (from, to, delta, gains, losses) => {
          const money = delta === 0 ? "the same price" : `${aed(Math.abs(delta))} ${delta > 0 ? "more" : "less"}${to.from || from.from ? " to start" : ""}, one-off`;
          const parts = [money];
          if (gains) parts.push(`${gains} ${gains > 1 ? "things" : "thing"} added`);
          if (losses) parts.push(`${losses} you'd give up`);
          return `${to.name}: ${parts.join(" · ")}`;
        },
      }}
      onChoosePlan={(plan) => {
        window.dispatchEvent(new CustomEvent<PickPackage>(PICK_PACKAGE, { detail: builderKey(plan.id) }));
        document.getElementById("builder")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      }}
    />
  );
}
