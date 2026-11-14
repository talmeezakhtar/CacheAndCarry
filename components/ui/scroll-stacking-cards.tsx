/**
 * Project Deck, original by Aakash Mehra, adapted for the Vibe & Pixel work section.
 *
 * A scroll-dealt deck of sites. As you scroll, the next card rises from below leaning toward
 * you and out of focus, then flattens and sharpens as it lands; the cards beneath sink back and dim.
 * The bottom-right corner of each card is cut away to hold the visit button.
 *
 * Changes from the original: no embedded sample projects, one accent action colour instead of a
 * per-project accent, 12px radius.
 */
"use client";

import { useRef } from "react";
import { MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/locale-provider";

export type Project = {
  name: string;
  /** One short line: what the site is. */
  summary: string;
  url: string;
  /** A screenshot of the site, ideally 16:9. */
  image: string;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function ProjectDeck({ projects, ground = "#f4f5f1", className }: { projects: Project[]; ground?: string; className?: string }) {
  const deck = useRef(null as HTMLElement | null);
  const { t } = useI18n();
  const reduce = useReducedMotion() ?? false;
  const count = projects.length;
  const { scrollYProgress } = useScroll({ target: deck, offset: ["start start", "end end"] });
  // a light, critically damped smoothing: it follows the wheel closely and never overshoots
  const progress = useSpring(scrollYProgress, { stiffness: 380, damping: 48, mass: 0.35 });

  return (
    <MotionConfig reducedMotion="user">
      {/* one screen of scroll per card (0.6 of a screen per extra card on phones, where the deck otherwise
          eats ~3 thumb-scrolls); the stage stays pinned while they are dealt onto it */}
      <section
        ref={deck}
        className={cn("relative h-[var(--deck-phone)] w-full sm:h-[var(--deck)]", className)}
        style={{ "--deck": `${Math.max(1, count) * 100}svh`, "--deck-phone": `${100 + Math.max(0, count - 1) * 60}svh` } as React.CSSProperties}
        aria-label={t("Our work")}
      >
        <div className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden px-3 pt-6 [perspective:1800px] sm:px-4 lg:px-6">
          {projects.map((p, i) => (
            <Card key={p.url} p={p} i={i} count={count} progress={progress} still={reduce} ground={ground} />
          ))}
        </div>
      </section>
    </MotionConfig>
  );
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const ENTER = 0.72; // share of each card's screen spent arriving; the rest it rests in place

/** How far card `j` has arrived (0 below the window, 1 landed) at deck progress `v`. */
function arrived(j: number, v: number, count: number) {
  if (j <= 0) return 1;
  const span = Math.max(1, count - 1);
  return easeOut(clamp01((v * span - (j - 1)) / ENTER));
}

function Card({ p, i, count, progress, still, ground }: {
  p: Project; i: number; count: number; progress: MotionValue<number>; still: boolean; ground: string;
}) {
  const { t } = useI18n();
  const summary = t(p.summary);
  // cards now lying on top of this one, counted smoothly
  const above = (v: number) => {
    let n = 0;
    for (let j = i + 1; j < count; j++) n += arrived(j, v, count);
    return Math.min(3, n);
  };
  const y = useTransform(progress, (v) => `${(1 - arrived(i, v, count)) * 108 - above(v) * 5}svh`); // covered cards lift so their edges show
  const rotateX = useTransform(progress, (v) => -(1 - arrived(i, v, count)) * 30 + above(v) * 5);
  const scale = useTransform(progress, (v) => 0.9 + 0.1 * arrived(i, v, count) - above(v) * 0.05);
  const filter = useTransform(progress, (v) => `blur(${((1 - arrived(i, v, count)) ** 2 * 12 + above(v) * 1.1).toFixed(2)}px)`);
  const dim = useTransform(progress, (v) => above(v) * 0.15);
  // reduced motion: no travel, each card simply appears in place when its turn comes
  const stillY = useTransform(progress, (v) => (arrived(i, v, count) >= 0.5 ? "0svh" : "110svh"));

  return (
    <motion.article
      aria-label={`${p.name}: ${summary}`}
      className="col-start-1 row-start-1 w-[min(100%,calc(86svh*16/9))] origin-[50%_25%] will-change-[transform,filter] max-sm:w-full"
      style={{ zIndex: i + 1, ...(still ? { y: stillY } : { y, rotateX, scale, filter }) }}
    >
      <div className="relative overflow-hidden rounded-xl shadow-[0_50px_90px_-35px_rgb(23_33_27/0.5)]" style={{ background: ground }}>
        {/* the whole site, edge to edge */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt={t("{name} website, home page: {summary}", { name: p.name, summary })}
          loading={i < 2 ? "eager" : "lazy"}
          decoding="async"
          className="block aspect-[16/9] w-full bg-surface object-cover object-top max-sm:aspect-[4/5]"
        />
        <Visit p={p} ground={ground} />
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-ink" style={{ opacity: still ? 0 : dim }} />
      </div>
    </motion.article>
  );
}

/** The visit button, set into a corner cut out of the card. */
function Visit({ p, ground }: { p: Project; ground: string }) {
  const { t } = useI18n();
  const R = 12;
  const corner = (
    <svg aria-hidden width={R} height={R} viewBox={`0 0 ${R} ${R}`} className="block">
      <path d={`M${R} 0 V${R} H0 A${R} ${R} 0 0 0 ${R} 0 Z`} fill={ground} />
    </svg>
  );
  return (
    <div className="absolute right-0 bottom-0 z-10">
      <div className="absolute right-0 bottom-full">{corner}</div>
      <div className="absolute right-full bottom-0">{corner}</div>
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("Open {name} (opens in a new tab)", { name: p.name })}
        className="group flex items-center gap-4 rounded-tl-xl py-3 pr-1 pl-5 text-ink outline-none sm:gap-5 sm:py-4 sm:pl-7"
        style={{ background: ground }}
      >
        <span className="flex flex-col leading-tight">
          <span className="flex items-center gap-2 text-base font-bold sm:text-lg">
            {p.name}
          </span>
          <span className="text-sm text-ink/80 underline-offset-4 group-hover:underline group-focus-visible:underline sm:text-base">{t(p.summary)}</span>
        </span>
        <span className="grid size-11 place-items-center rounded-full bg-ink text-surface transition-transform duration-200 ease-out group-hover:rotate-45 group-active:scale-90 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent sm:size-[52px]">
          <ArrowUpRight className="size-5 sm:size-6 rtl:-scale-x-100" strokeWidth={2.2} />
        </span>
      </a>
    </div>
  );
}
