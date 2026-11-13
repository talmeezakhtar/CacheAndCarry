"use client";

import { MotionConfig, motion, useInView } from "motion/react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import { useRef, useState, useSyncExternalStore } from "react";

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
export function PrismaHero({ video, videoSmall, poster, whatsappHref }: { video?: string; videoSmall?: string; poster: string; whatsappHref: string }) {
  // The video is added only after mount, and never for reduced motion: server and browser render the same poster,
  // and reduced-motion visitors never download the clip.
  const motionOk = useSyncExternalStore(onMotionChange, () => matchMedia(MOTION_OK).matches, () => false);
  const [playing, setPlaying] = useState(false);
  const { t } = useI18n();
  const [paused, setPaused] = useState(false); // WCAG 2.2.2: anything moving for more than 5 seconds can be paused
  const videoRef = useRef<HTMLVideoElement>(null);
  const togglePause = () => {
    const v = videoRef.current;
    if (v) void (paused ? v.play().catch(() => {}) : v.pause());
    setPaused(!paused);
  };
  const media = "absolute inset-0 h-full w-full object-cover";
  // Read only once motionOk is true, which is after hydration, so the server never touches window.
  // Phones get the 1280px file (the hero is cropped to portrait there anyway); Data Saver gets the poster only.
  const saveData = motionOk && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  const src = motionOk && videoSmall && matchMedia("(max-width: 767px)").matches ? videoSmall : video;
  return (
    <MotionConfig reducedMotion="user">
      {/* Fills its parent: the page gives the offer bar + hero one screen, so the hero is whatever the bar leaves. */}
      <section id="hero" className="h-full w-full">
        <div className="relative h-full w-full overflow-hidden bg-ink text-surface">
          {/* The poster frame is always underneath; the video fades in over it once frames are actually playing,
              so there is no black flash or pop while it loads. Full-quality file, never re-encoded here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" fetchPriority="high" className={media} />
          {src && motionOk && !saveData && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              src={src}
              onPlaying={() => setPlaying(true)}
              // autoplay can start before React attaches onPlaying; timeupdate keeps firing, so this always catches it
              onTimeUpdate={() => !playing && setPlaying(true)}
              className={`${media} transition-opacity duration-700 ease-out ${playing ? "opacity-100" : "opacity-0"}`}
            />
          )}
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-70 mix-blend-overlay" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

          {motionOk && !saveData && (
            <button
              type="button"
              onClick={togglePause}
              aria-pressed={paused}
              aria-label={t(paused ? "Play the hero animation" : "Pause the hero animation")}
              className="absolute end-3 top-16 z-30 grid size-11 place-items-center rounded-full bg-black/35 text-surface backdrop-blur-sm transition-colors hover:bg-black/55 md:end-5 md:top-5"
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          )}

          <div className="absolute inset-x-0 bottom-0 grid grid-cols-12 items-end gap-4 px-4 pb-6 sm:px-6 md:px-10 lg:pb-10">
            {/* The offer leads; the name is a small mark above it (the nav and the footer carry it too). */}
            <div className="col-span-12 lg:col-span-8">
              <motion.p {...rise(0.1)} className="font-heading text-2xl tracking-tight text-surface/90 md:text-3xl">
                Cache &amp; Carry
              </motion.p>
              <h1 className="mt-3 font-heading text-[12.5vw] leading-[0.95] tracking-[-0.03em] sm:text-[9vw] lg:text-[min(6.6vw,6.75rem)]">
                <WordsPullUp text={t("Your business online in 5\u00a0working days.")} />
              </h1>
            </div>

            <div className="col-span-12 flex flex-col items-start gap-5 lg:col-span-4">
              <motion.p {...rise(0.55)} className="max-w-[40ch] leading-snug text-surface/85 md:text-lg">
                {t("English and Arabic websites for small businesses in Sharjah and Dubai.")}
              </motion.p>
              <motion.a
                {...rise(0.7)}
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-surface py-1 ps-5 pe-1 font-bold text-ink transition-all hover:gap-3 hover:bg-page active:scale-[0.98]"
              >
                {t("Chat on WhatsApp")}
                <span className="flex size-10 items-center justify-center rounded-full bg-ink transition-transform group-hover:scale-110">
                  <ArrowRight className="size-4 text-surface rtl:-scale-x-100" />
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
