"use client";

import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { useI18n } from "@/components/locale-provider";

/** Fills {key} slots in a translated sentence with elements, so word order can follow the language. */
const rich = (template: string, slots: Record<string, React.ReactNode>) =>
  template.split(/(\{\w+\})/).map((part, i) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    return key && key in slots ? <span key={i}>{slots[key]}</span> : part;
  });

/**
 * Founding-offer bar above the hero, read left to right in one glance: badge, the deal (old price struck),
 * the condition, scarcity, and one button. Phones keep a single line (price, places left, button) so the
 * hero below still fits the screen. Closing it hides it until the next page load.
 */
export function AnnouncementBar({ price, was, left, places, href }: { price: number; was: number; left: number; places: number; href: string }) {
  const [open, setOpen] = useState(true);
  const { t, money: aed, locale } = useI18n();
  if (!open || left <= 0) return null;
  return (
    <div className="relative shrink-0 bg-accent text-surface">
      <div className="mx-auto flex min-h-12 max-w-[1200px] items-center justify-center gap-x-3 py-2 ps-4 pe-12 text-sm sm:gap-x-4 sm:ps-12 sm:text-[15px]">
        <span className="hidden shrink-0 rounded-full bg-sage-light px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-ink md:inline">
          {t("Founding offer")}
        </span>

        <p className="min-w-0 truncate">
          {/* phones: the deal and the scarcity only */}
          <span className="sm:hidden">
            <strong>{t("Starter site {price}", { price: aed(price) })}</strong>
            <span className="text-surface/85"> · {left < places ? t("{n} left", { n: left }) : t("{n} places", { n: places })}</span>
          </span>
          {/* larger screens: the full offer, still one line */}
          <span className="max-sm:hidden">
            {locale === "en" ? (
              <>
                Your Starter site for <s className="text-surface/85 decoration-1">{aed(was)}</s> <strong className="text-base">{aed(price)}</strong>
                <span className="text-surface/85"> in return for a short testimonial.</span>
              </>
            ) : (
              rich(t("Your Starter site for {price} instead of {was}, in return for a short testimonial."), {
                price: <strong className="text-base">{aed(price)}</strong>,
                was: <s className="text-surface/85 decoration-1">{aed(was)}</s>,
              })
            )}{" "}
            {/* "Only N left" once places are taken; until then just the number, so the bar never overstates scarcity */}
            <strong>{left < places ? t("Only {left} of {places} places left.", { left, places }) : t("{places} founding places.", { places })}</strong>
          </span>
        </p>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-surface px-3.5 text-sm font-bold text-ink transition-colors hover:bg-white focus-visible:outline-surface sm:px-4"
        >
          <span className="sm:hidden">{t("Claim")}</span>
          <span className="max-sm:hidden">{t("Claim a place")}</span>
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
        </a>
      </div>

      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label={t("Close the founding offer")}
        className="absolute end-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-surface/85 transition-colors hover:bg-white/10 hover:text-surface focus-visible:outline-surface"
      >
        <X className="size-4.5" />
      </button>
    </div>
  );
}
