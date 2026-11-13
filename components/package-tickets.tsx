"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import AdmitOneTicket, { TICKET_LAYOUT, TICKET_TEXTURE } from "@/components/ui/admit-one-ticket";
import { messages, packages, paymentTerms, wa } from "@/lib/site";
import { QUOTE_THRESHOLD, aed } from "@/lib/quote";

// One palette per package, from the Moss Light family plus a warm ochre for contrast.
// Ink was checked against both texture colours (back and front) for at least 4.5:1.
const palettes: Record<string, { back: string; front: string; ink: string; watermark: string }> = {
  Starter: { back: "#b9c79e", front: "#dfe6cf", ink: "#17211b", watermark: "#fcfcfa" },
  Business: { back: "#3e5730", front: "#587245", ink: "#fcfcfa", watermark: "#8aa36a" },
  Pro: { back: "#c9a45c", front: "#e3c88f", ink: "#2b2216", watermark: "#f6ecd4" },
  Store: { back: "#17211b", front: "#3a4130", ink: "#fcfcfa", watermark: "#3f6b3a" },
};

/** The ticket is laid out for one pixel width, so measure the slot and redraw at its width. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.floor(el.clientWidth)); // first size now, so the ticket draws without waiting a frame
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function Ticket({ pkg, index }: { pkg: (typeof packages)[number]; index: number }) {
  const [ref, width] = useWidth();
  const c = palettes[pkg.label];
  const price = aed(pkg.price);
  return (
    // the slot reserves the ticket's shape before it is measured, so nothing jumps
    <div ref={ref} aria-hidden className="aspect-[741/425] w-full">
      {width > 0 && (
        <AdmitOneTicket
          tilt={{}}
          width={width}
          name={pkg.label}
          presenter="Cache & Carry"
          event="Build package"
          venue={pkg.note}
          dates={pkg.price > QUOTE_THRESHOLD ? "quoted in writing" : paymentTerms(pkg.label).toLowerCase()}
          stubText={price}
          watermark={String(index + 1).padStart(2, "0")}
          layout={{ ...TICKET_LAYOUT, stubSize: 46 / 741, inkColor: c.ink, watermarkColor: c.watermark, watermarkOpacity: 0.35 }}
          texture={{ ...TICKET_TEXTURE, colorBack: c.back, colorFront: c.front, colorHighlight: c.front, speed: 0 }} /* a still paper texture: drawn once, no animation loop running on phones */
        />
      )}
    </div>
  );
}

/** The price builder's link for a package: Starter and Business are priced there, Pro and Store open its "Bigger site" choice. */
export const estimateHref = (label: string) => `/estimate?p=${label === "Starter" || label === "Business" ? label.toLowerCase() : "quote"}`;

/** The four build packages (PDF 6.2) as tickets, with what's included and a WhatsApp button under each.
 *  The ticket itself opens the price builder with that package already picked. */
export function PackageTickets() {
  return (
    <div className="mt-6 grid gap-x-8 gap-y-12 md:grid-cols-2">
      {packages.map((p, i) => (
        <article key={p.label}>
          <h4 className="sr-only">{p.label}</h4>
          <Link href={estimateHref(p.label)} aria-label={`Build an estimate with ${p.label}`} className="block rounded-2xl">
            <Ticket pkg={p} index={i} />
          </Link>
          {/* The ticket prints its price sideways on the stub; here it is again, flat and readable. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="font-heading text-3xl tabular-nums">
              {p.from && <span className="text-xl">From </span>}
              {aed(p.price)}
            </p>
            <p className="text-sm text-ink/80">
              {p.note}. {p.price > QUOTE_THRESHOLD ? "Confirmed in a written quote." : `${paymentTerms(p.label)}.`}
            </p>
            {i === 0 && <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold text-surface">Best for a first site</span>}
          </div>
          <ul className="mt-4 grid gap-2.5">
            {p.items.map((f) => (
              <li key={f} className="flex gap-3">
                <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={estimateHref(p.label)}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 font-bold text-surface transition-colors hover:bg-ink/85 active:scale-[0.98]"
            >
              Build your estimate
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={wa(messages.package(p.label))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-bold underline decoration-accent decoration-2 underline-offset-4 hover:decoration-ink"
            >
              Ask about {p.label}
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
