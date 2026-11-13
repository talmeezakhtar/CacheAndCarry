"use client";

import { MotionConfig, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const ease = [0.16, 1, 0.3, 1] as const;
const rise = (delay: number) => ({
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.8, delay, ease },
});

/* Words rise in one by one once the line is in view. */
export const WordsPullUp = ({ text, className = "" }: { text: string; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <span ref={ref} className={`flex flex-wrap gap-x-[0.22em] ${className}`}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

const nouns = ["shop", "salon", "café", "boutique", "clinic"];

/* The one looping word in the hero. Stops for reduced-motion users and when the visitor pauses the hero. */
function RotatingNoun({ paused }: { paused: boolean }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % nouns.length), 2600);
    return () => clearInterval(t);
  }, [reduce, paused]);
  return (
    <motion.span
      key={nouns[i]}
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="inline-block italic text-sage-pale" /* pale sage: olive is unreadable over the dark video */
    >
      {nouns[i]}
    </motion.span>
  );
}

const MOTION_OK = "(prefers-reduced-motion: no-preference)";
const onMotionChange = (cb: () => void) => {
  const mq = matchMedia(MOTION_OK);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Prisma-style hero: full-bleed video (poster image for reduced motion), noise and gradient
 * overlays, giant wordmark bottom-left, headline and the one WhatsApp action bottom-right.
 * The nav tab lives in the page so it can stay fixed while scrolling.
 */
export function PrismaHero({ video, poster, whatsappHref }: { video?: string; poster: string; whatsappHref: string }) {
  // The video is added only after mount, and never for reduced motion: server and browser render the same poster,
  // and reduced-motion visitors never download the clip.
  const motionOk = useSyncExternalStore(onMotionChange, () => matchMedia(MOTION_OK).matches, () => false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false); // WCAG 2.2.2: anything moving for more than 5 seconds can be paused
  const videoRef = useRef<HTMLVideoElement>(null);
  const togglePause = () => {
    const v = videoRef.current;
    if (v) void (paused ? v.play().catch(() => {}) : v.pause());
    setPaused(!paused);
  };
  const media = "absolute inset-0 h-full w-full object-cover";
  return (
    <MotionConfig reducedMotion="user">
      {/* Fills its parent: the page gives the offer bar + hero one screen, so the hero is whatever the bar leaves. */}
      <section id="hero" className="h-full w-full">
        <div className="relative h-full w-full overflow-hidden bg-ink text-surface">
          {/* The poster frame is always underneath; the video fades in over it once frames are actually playing,
              so there is no black flash or pop while it loads. Full-quality file, never re-encoded here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" fetchPriority="high" className={media} />
          {video && motionOk && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              src={video}
              onPlaying={() => setPlaying(true)}
              // autoplay can start before React attaches onPlaying; timeupdate keeps firing, so this always catches it
              onTimeUpdate={() => !playing && setPlaying(true)}
              className={`${media} transition-opacity duration-700 ease-out ${playing ? "opacity-100" : "opacity-0"}`}
            />
          )}
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-70 mix-blend-overlay" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

          {motionOk && (
            <button
              type="button"
              onClick={togglePause}
              aria-pressed={paused}
              aria-label={paused ? "Play the hero animation" : "Pause the hero animation"}
              className="absolute right-3 top-16 z-30 grid size-11 place-items-center rounded-full bg-black/35 text-surface backdrop-blur-sm transition-colors hover:bg-black/55 md:right-5 md:top-5"
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          )}

          <div className="absolute inset-x-0 bottom-0 grid grid-cols-12 items-end gap-4 px-4 pb-6 sm:px-6 md:px-10 lg:pb-10">
            <p
              aria-hidden
              className="col-span-12 font-heading text-[21vw] leading-[0.85] tracking-[-0.05em] lg:col-span-8 lg:text-[min(13vw,13.5rem)]"
            >
              <WordsPullUp text="Cache &" />
              <WordsPullUp text="Carry" />
            </p>

            <div className="col-span-12 flex flex-col items-start gap-5 lg:col-span-4">
              <motion.h1 {...rise(0.4)} className="font-heading text-3xl leading-[1.1] md:text-4xl">
                Your <RotatingNoun paused={paused} /> online in 5 working days.
              </motion.h1>
              <motion.p {...rise(0.55)} className="max-w-[42ch] leading-snug text-surface/85 md:text-lg">
                Websites for small businesses in Sharjah and Dubai, in English and Arabic. A one-page Starter site goes live 5 working days after we
                have your content.
              </motion.p>
              <motion.a
                {...rise(0.7)}
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-surface py-1 pl-5 pr-1 font-bold text-ink transition-all hover:gap-3 hover:bg-page active:scale-[0.98]"
              >
                Chat on WhatsApp
                <span className="flex size-10 items-center justify-center rounded-full bg-ink transition-transform group-hover:scale-110">
                  <ArrowRight className="size-4 text-surface" />
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
