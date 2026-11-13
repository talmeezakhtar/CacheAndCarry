"use client";

import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { aed } from "@/lib/quote";

/**
 * Founding-offer bar above the hero, read left to right in one glance: badge, the deal (old price struck),
 * the condition, scarcity, and one button. Phones keep a single line (price, places left, button) so the
 * hero below still fits the screen. Closing it hides it until the next page load.
 */
export function AnnouncementBar({ price, was, left, places, href }: { price: number; was: number; left: number; places: number; href: string }) {
  const [open, setOpen] = useState(true);
  if (!open || left <= 0) return null;
  return (
    <div className="relative shrink-0 bg-accent text-surface">
      <div className="mx-auto flex min-h-12 max-w-[1200px] items-center justify-center gap-x-3 py-2 pl-4 pr-12 text-sm sm:gap-x-4 sm:pl-12 sm:text-[15px]">
        <span className="hidden shrink-0 rounded-full bg-[#b9c79e] px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-ink md:inline">
          Founding offer
        </span>

        <p className="min-w-0 truncate">
          {/* phones: the deal and the scarcity only */}
          <span className="sm:hidden">
            <strong>Starter site {aed(price)}</strong>
            <span className="text-surface/85"> · {left} left</span>
          </span>
          {/* larger screens: the full offer, still one line */}
          <span className="max-sm:hidden">
            Your Starter site for <s className="text-surface/85 decoration-1">{aed(was)}</s> <strong className="text-base">{aed(price)}</strong>
            <span className="text-surface/85"> in return for a short testimonial.</span>{" "}
            <strong>
              Only {left} of {places} places left.
            </strong>
          </span>
        </p>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-surface px-3.5 text-sm font-bold text-ink transition-colors hover:bg-white focus-visible:outline-surface sm:px-4"
        >
          <span className="sm:hidden">Claim</span>
          <span className="max-sm:hidden">Claim a place</span>
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close the founding offer"
        className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-surface/85 transition-colors hover:bg-white/10 hover:text-surface focus-visible:outline-surface"
      >
        <X className="size-4.5" />
      </button>
    </div>
  );
}
