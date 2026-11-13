import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PriceBuilder } from "@/components/price-builder";
import { PackageDiff } from "@/components/package-diff";
import { SiteNav } from "@/components/site-nav";
import { messages, site, wa } from "@/lib/site";
import { QUOTE_THRESHOLD, aed } from "@/lib/quote";

// The price builder on its own page, so the homepage's prices stay a short read.
// Tickets link here with ?p=starter|business|quote; the builder reads and keeps its choices in the URL.
const title = "Build your estimate · Cache & Carry";
const description = "Pick a website package, add what you need and see the total in AED, then send it to us on WhatsApp.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/estimate" },
  openGraph: { title, description, type: "website", siteName: site.name, url: "/estimate" },
};

const wrap = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8";
const ext = { target: "_blank", rel: "noopener noreferrer" };

// The house rules a visitor checks before trusting a total, set as ledger lines beside the heading.
const rules = [
  ["Prices", "In AED, as published"],
  ["Charged here", "Nothing"],
  ["Over " + aed(QUOTE_THRESHOLD), "Confirmed in writing"],
  ["Sent on", "WhatsApp, you edit it first"],
];

export default function Estimate() {
  return (
    <>
      <header className="border-b border-line bg-surface">
        <SiteNav home={false} current="prices" className="mx-auto" />

        <div className={`${wrap} grid gap-10 pb-12 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] md:items-end md:gap-16 md:pb-16 md:pt-12`}>
          <div>
            <Link href="/#prices" className="-ml-1 inline-flex min-h-11 items-center gap-2 px-1 text-sm font-bold text-ink/80 transition-colors hover:text-ink">
              <ArrowLeft aria-hidden className="size-4" />
              All prices
            </Link>
            <h1 className="mt-4 max-w-[16ch] font-heading text-[2.75rem] leading-[1.05] tracking-tight md:text-[4rem]">Build your estimate.</h1>
            <p className="mt-5 max-w-[56ch] text-lg text-ink/80">
              Pick a package, tick what you need and watch the total add up. Not sure where to start?{" "}
              <a href={wa(messages.starter)} {...ext} className="font-bold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:decoration-ink">
                Start with Starter
              </a>
              .
            </p>
          </div>

          <dl className="border-t border-ink text-sm">
            {rules.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
                <dt className="text-ink/80">{k}</dt>
                <dd className="text-right font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main id="main" className={`${wrap} pb-16 pt-10 md:pb-28 md:pt-14`}>
        <section aria-labelledby="compare-title" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
          <div>
            <h2 id="compare-title" className="font-heading text-2xl md:text-3xl">
              Compare two packages
            </h2>
            <p className="mt-1 max-w-[60ch] text-ink/80">Tap any two to see only what changes between them, then take one into the estimate.</p>
            <div className="mt-5">
              <PackageDiff />
            </div>
          </div>
        </section>
        <div className="mt-14 md:mt-20">
          <PriceBuilder />
        </div>
      </main>

      <footer className="bg-ink text-surface/80">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-sm`}>
          <p>
            <Link href="/" className="font-heading text-lg text-surface">
              {site.name}
            </Link>
            <span className="ml-3">Working name, not yet registered</span>
          </p>
          <nav aria-label="Legal" className="flex gap-5">
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-surface">
              Privacy
            </Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-surface">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
