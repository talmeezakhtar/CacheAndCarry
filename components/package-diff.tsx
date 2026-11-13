"use client";

import { useMemo } from "react";
import { TwoPlanDiffPricingTable, type DiffGroup, type DiffPlan } from "@/components/ui/two-plan-diff-pricing-table";
import { addOns, included, packages, paymentTerms, site } from "@/lib/site";
import { QUOTE_THRESHOLD } from "@/lib/quote";
import type { I18n } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";
import { PICK_PACKAGE, type PickPackage } from "@/components/price-builder";

/*
 * "Compare two packages": pick any two of the four build packages and see only what changes between them.
 * Every value comes from lib/site.ts with the same rule as the builder: a feature is included only when the
 * package lists it, otherwise it shows its add-on price. The buttons hand the package to the builder below.
 * Values are compared by their English source (ranks below); only the printed text is translated.
 */

type Pkg = (typeof packages)[number];
const id = (p: Pkg) => p.label.toLowerCase();
const has = (p: Pkg, item: string) => (p.items as readonly string[]).includes(item);
const each = <T,>(f: (p: Pkg) => T) => Object.fromEntries(packages.map((p) => [id(p), f(p)]));

function build({ t, money }: I18n) {
  const addOn = (label: string) => t("Add-on, {price}", { price: money(addOns.find((a) => a.label === label)?.price ?? null) });
  /** Included beats an add-on; the rank tells the table which way is an upgrade. */
  const extra = (label: string) => ({ values: each((p) => (has(p, label) ? true : addOn(label))), rank: [addOn(label), true] });
  const sizes = { starter: t("1 page"), business: t("Up to 4 pages"), pro: t("Up to 7 pages"), store: t("Online shop") };

  const plans: DiffPlan[] = packages.map((p) => ({
    id: id(p),
    name: t(p.label),
    price: p.price,
    currency: "AED ",
    interval: "",
    from: "from" in p && p.from,
    priceLabel: `${"from" in p && p.from ? t("From ") : ""}${money(p.price)}`,
    actionLabel: t("Estimate with {name}", { name: t(p.label) }),
  }));

  const groups: DiffGroup[] = [
    {
      id: "site",
      label: "Your site",
      features: [
        { id: "size", label: t("Size"), values: sizes, rank: [sizes.starter, sizes.business, sizes.pro] },
        { id: "shop", label: t("Online shop and payments"), values: each((p) => id(p) === "store") },
        { id: "products", label: t("Products"), values: each((p) => (id(p) === "store" ? t("Up to 20") : false)), rank: [false, t("Up to 20")] },
        { id: "form", label: t("Custom enquiry form"), values: each((p) => id(p) === "pro") },
      ],
    },
    {
      id: "google",
      label: "Google",
      features: [
        { id: "seo", label: t("Basic SEO setup"), ...extra("Basic SEO setup") },
        { id: "gbp", label: t("Google Business Profile setup"), ...extra("Google Business Profile setup") },
      ],
    },
    {
      id: "terms",
      label: "Terms",
      features: [
        {
          id: "pay",
          label: t("How you pay"),
          values: each((p) => (p.price > QUOTE_THRESHOLD ? t("Written quote, then 50/50") : p.label === "Starter" ? t(paymentTerms(p.label)) : t("50/50"))),
        },
        { id: "live", label: t("Goes live"), values: each((p) => (id(p) === "starter" ? t(site.delivery) : t("Date in your quote"))) },
      ],
    },
    {
      // The same in every package, so these sit under "Same in both".
      id: "every",
      label: "Every package",
      features: included.map((item) => ({ id: item, label: t(item).replace(/^./, (c) => c.toUpperCase()), values: each(() => true) })),
    },
  ];
  return { plans, groups };
}

/** Arabic counts: 1 and 2 have their own forms, 3 to 10 take the plural, 11 and up the singular. */
const arCount = (n: number, one: string, two: string, few: string, many: string) => (n === 1 ? one : n === 2 ? two : n <= 10 ? `${n} ${few}` : `${n} ${many}`);

/** Starter and Business are priced in the builder; Pro and Store open its "Bigger site" choice. */
const builderKey = (planId: string): PickPackage => (planId === "starter" ? "Starter" : planId === "business" ? "Business" : "Quote");

export function PackageDiff() {
  const i = useI18n();
  const { t, money, locale } = i;
  const { plans, groups } = useMemo(() => build(i), [i]);
  return (
    <TwoPlanDiffPricingTable
      plans={plans}
      groups={groups}
      defaultPair={["starter", "business"]}
      className="max-w-none"
      labels={{
        picker: t("Choose two packages to compare"),
        swap: t("Swap the two packages"),
        feature: t("What you get"),
        gain: t("You gain"),
        loss: t("You lose"),
        changed: t("Different"),
        showSame: t("Same in both"),
        hideSame: t("Hide what's the same"),
        upgrade: t("Upgrade"),
        downgrade: t("Downgrade"),
        included: t("Included"),
        notIncluded: t("Not included"),
        keep: (p) => t("Estimate with {name}", { name: p.name }),
        summary: (from, to, delta, gains, losses) => {
          const amount = money(Math.abs(delta));
          const money_ = delta === 0 ? t("the same price") : `${t(delta > 0 ? "{amount} more" : "{amount} less", { amount })}${to.from || from.from ? t(" to start") : ""}${t(", one-off")}`;
          const parts = [money_];
          if (locale === "ar") {
            if (gains) parts.push(arCount(gains, "إضافة واحدة", "إضافتان", "إضافات", "إضافة"));
            if (losses) parts.push(arCount(losses, "تتخلى عن ميزة واحدة", "تتخلى عن ميزتين", "ميزات تتخلى عنها", "ميزة تتخلى عنها"));
          } else {
            if (gains) parts.push(`${gains} ${gains > 1 ? "things" : "thing"} added`);
            if (losses) parts.push(`${losses} you'd give up`);
          }
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
