"use client";

import React from "react";
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from "motion/react";

/**
 * How It Works: pinned step cards on lined paper, joined by a dashed path that crawls along.
 *
 * Changes from the original: no dark: variants (the site has one light theme, and v4's dark:
 * follows the OS, which turned the cards black on a light page), colours come from the site's
 * tokens instead of orange/blue/purple, step numbers use the serif instead of Comic Sans, each
 * card can carry a short `note` (e.g. "Day 0"), and the path stops moving for reduced motion.
 */

export interface Step {
  title: string;
  description: string;
  /** Small label under the description, e.g. "Day 0". */
  note?: string;
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

const Pin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({ number, step, className, rotate }: { number: string; step: Step; className?: string; rotate?: string }) => (
  <li className={`relative w-full transition-transform duration-300 hover:z-30 hover:scale-105 md:w-[300px] ${rotate ?? ""} ${className ?? ""}`}>
    <div className="rounded-[25px] border border-line bg-page p-2 shadow-[0_10px_20px_0_rgb(23_33_27/0.12)]">
      <Pin className="z-20 mx-auto mb-6 size-8 text-accent" />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[15px] border border-accent/20 bg-surface p-[15px]">
        <span className="mb-5 font-heading text-4xl text-accent">{number}</span>
        <h3 className="mb-[10px] text-2xl font-semibold leading-tight text-ink">{step.title}</h3>
        <p className="text-sm/5 text-ink/80">{step.description}</p>
        {step.note && <p className="mt-4 text-sm font-bold text-accent">{step.note}</p>}
      </div>
    </div>
  </li>
);

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[15%]", rotate: "md:rotate-6" },
  { className: "md:absolute md:top-[120px] md:right-[15%]", rotate: "md:-rotate-6" },
  { className: "md:absolute md:top-[450px] md:left-[15%]", rotate: "md:rotate-6" },
  { className: "md:absolute md:top-[570px] md:right-[10%]", rotate: "md:-rotate-6" },
  { className: "md:absolute md:top-[850px] md:left-[15%]", rotate: "md:rotate-6" },
];

const HEIGHTS = [0, 400, 450, 800, 900, 1130];

// Curve segments joining card n to card n+1, in a 1000-wide viewBox.
const SEGMENTS = [
  "M 290 150 C 500 150, 550 270, 710 270",
  " C 850 270, 500 350, 290 450",
  " C 290 600, 550 720, 750 720",
  " C 950 720, 500 800, 290 850",
];

export default function HowItWorks({ features, className, stepPositions = DEFAULT_CARD_POSITIONS }: HowItWorksProps) {
  // MotionConfig's reducedMotion only covers transforms, so the dash crawl is switched off by hand.
  const reduce = useReducedMotion();
  const height = HEIGHTS[Math.min(features.length, 5)];
  const path = SEGMENTS.slice(0, Math.max(0, features.length - 1)).join("");

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <div className={`relative px-4 max-md:pb-16 max-md:pt-10 sm:px-8 md:py-16 ${className ?? ""}`}>
          {/* lined paper, fading out at the sides */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "linear-gradient(var(--color-ink) 1px, transparent 1px)", backgroundSize: "100% 32px", marginTop: "4px" }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-surface" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-surface" />

          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="relative mx-auto w-full max-w-[1000px] md:h-[var(--md-height)]" style={{ "--md-height": `${height}px` } as React.CSSProperties}>
              {path && (
                <svg aria-hidden className="pointer-events-none absolute left-0 top-0 z-0 hidden h-full w-full md:block" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none">
                  <m.path
                    d={path}
                    stroke="currentColor"
                    className="text-accent/40"
                    strokeWidth="2"
                    strokeDasharray="8 6"
                    fill="none"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ strokeDashoffset: 0 }}
                    animate={reduce ? undefined : { strokeDashoffset: -140 }} // a multiple of 14 (8 + 6) loops seamlessly
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </svg>
              )}

              <ol className="flex flex-col gap-8 md:block">
                {features.map((step, i) => {
                  const pos = stepPositions[i % stepPositions.length];
                  return <Card key={step.title} number={String(i + 1).padStart(2, "0")} step={step} rotate={pos.rotate} className={pos.className} />;
                })}
              </ol>
            </div>
          </div>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
