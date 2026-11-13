"use client";

import { useId } from "react";
import { motion } from "motion/react";

/*
 * Avatar orb (odysseyui). Changes from the original: only the three site presets (moss, sage, ochre), the vendor colours removed,
 * hidden from screen readers (it is decoration on a price card, not an "AI Avatar"), and no
 * pointer cursor since it does nothing when clicked.
 */

export type AvatarColor = "moss" | "sage" | "ochre";
export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square" | "squircle";

export interface AvatarProps {
  blinking?: boolean;
  color?: AvatarColor;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
}

const BLINK_KEYFRAMES = `
@keyframes av-blink {
  0%, 88%, 100% { transform: scaleY(1); }
  93%            { transform: scaleY(0.07); }
  97%            { transform: scaleY(0.07); }
}
@media (prefers-reduced-motion: reduce) { [data-av-eye] { animation: none !important; } }
`;
const SHINE = "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.1) 50%, transparent 70%)";
const shadow = (rgb: string) => `0 0 4px 0px rgba(${rgb},.35), 0 0 16px 6px rgba(${rgb},.18), inset 0 0 0 1px rgba(255,255,255,.05)`;

const PRESETS: Record<AvatarColor, { gradient: string; boxShadow: string; iris: string; shine: string }> = {
  moss: { gradient: "radial-gradient(circle at 50% 45%, #2e4022 0%, #4f6b3a 40%, #8aa36a 68%, #e3ead2 100%)", boxShadow: shadow("79,107,58"), iris: "linear-gradient(135deg, #ffffff 0%, #e8eedc 100%)", shine: SHINE },
  sage: { gradient: "radial-gradient(circle at 50% 45%, #3e5730 0%, #7f9a5f 40%, #b9c79e 68%, #eef2e3 100%)", boxShadow: shadow("127,154,95"), iris: "linear-gradient(135deg, #ffffff 0%, #eef2e3 100%)", shine: SHINE },
  ochre: { gradient: "radial-gradient(circle at 50% 45%, #6b4a12 0%, #b08236 40%, #e3c88f 68%, #f8efd9 100%)", boxShadow: shadow("176,130,54"), iris: "linear-gradient(135deg, #ffffff 0%, #f8efd9 100%)", shine: SHINE },
};

const SIZE: Record<AvatarSize, { orb: string; eye: string; eyeGap: string; eyeY: string }> = {
  sm: { orb: "size-8", eye: "w-1 h-1.5", eyeGap: "gap-1.5", eyeY: "-translate-y-0.5" },
  md: { orb: "size-12", eye: "w-1.5 h-2.5", eyeGap: "gap-2.5", eyeY: "-translate-y-0.5" },
  lg: { orb: "size-16", eye: "w-2 h-3", eyeGap: "gap-3.5", eyeY: "-translate-y-1" },
};

const SHAPE_RADIUS: Record<AvatarShape, string> = {
  circle: "rounded-full",
  square: "rounded-[0%]",
  squircle: "rounded-[40%]",
};

function Eye({ blinking, delayMs = 0, irisGradient, sizeClass }: { blinking: boolean; delayMs?: number; irisGradient: string; sizeClass: string }) {
  return (
    <div
      data-av-eye
      className={["rounded-full", sizeClass].join(" ")}
      style={{ background: irisGradient, ...(blinking ? { animation: `av-blink 3.6s ease-in-out ${delayMs}ms infinite` } : {}) }}
    />
  );
}

function Avatar({ blinking = true, color = "moss", size = "md", shape = "circle", className = "" }: AvatarProps) {
  const uid = useId().replace(/\W/g, "");
  const preset = PRESETS[color] ?? PRESETS.moss;
  const dims = SIZE[size] ?? SIZE.md;

  return (
    <>
      <style>{BLINK_KEYFRAMES}</style>
      <motion.div
        aria-hidden
        whileTap={{ scaleX: 1.15, scaleY: 1.3 }}
        transition={{ type: "tween", duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className={["relative flex items-center justify-center overflow-hidden", dims.orb, SHAPE_RADIUS[shape], className].filter(Boolean).join(" ")}
        style={{ background: preset.gradient, boxShadow: preset.boxShadow }}
      >
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.2] mix-blend-overlay" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id={`av-n${uid}`} x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter={`url(#av-n${uid})`} />
        </svg>

        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.2] mix-blend-overlay" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id={`grain-${uid}`} x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="3.2" numOctaves="1" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter={`url(#grain-${uid})`} />
        </svg>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: preset.shine }} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 blur-xs"
          style={{ background: "radial-gradient(circle at 62% 68%, rgba(0,0,0,0.18) 0%, transparent 55%)" }}
        />

        <div className={["relative z-10 flex items-center", dims.eyeGap, dims.eyeY].join(" ")}>
          <Eye blinking={blinking} delayMs={0} irisGradient={preset.iris} sizeClass={dims.eye} />
          <Eye blinking={blinking} delayMs={60} irisGradient={preset.iris} sizeClass={dims.eye} />
        </div>
      </motion.div>
    </>
  );
}

export default Avatar;
