import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PriceBuilder } from "@/components/price-builder";
import { PackageDiff } from "@/components/package-diff";
import { SiteNav } from "@/components/site-nav";
import { messages, shareImage, site, wa } from "@/lib/site";
import { QUOTE_THRESHOLD } from "@/lib/quote";
import { i18n, type Locale } from "@/lib/i18n";
import { estimateJsonLd, jsonLdHtml } from "@/lib/structured-data";

// The price builder on its own page, so the homepage's prices stay a short read. Served at /estimate and /ar/estimate.
// Tickets link here with ?p=starter|business|quote; the builder reads and keeps its choices in the URL.
export const estimateMetadata = (locale: Locale): Metadata => {
  const { t, path } = i18n(locale);
  const title = t("Build your estimate · Cache & Carry");
  const description = t("Pick a website package, add what you need and see the total in AED, then send it to us on WhatsApp.");
  return {
    title,
    description,
    alternates: { canonical: path("/estimate"), languages: { en: "/estimate", ar: "/ar/estimate", "x-default": "/estimate" } },
    openGraph: { title, description, type: "website", siteName: site.name, url: path("/estimate"), locale: locale === "ar" ? "ar_AE" : "en_AE", images: [shareImage] },
    twitter: { card: "summary_large_image", title, description, images: [shareImage] },
  };
};

const wrap = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8";
const ext = { target: "_blank", rel: "noopener noreferrer" };

export function EstimatePage({ locale }: { locale: Locale }) {
  const i = i18n(locale);
  const { t, money, path } = i;
  // The house rules a visitor checks before trusting a total, set as ledger lines beside the heading.
  const rules = [
    [t("Prices"), t("In AED, as published")],
    [t("Charged here"), t("Nothing")],
    [t("Over {amount}", { amount: money(QUOTE_THRESHOLD) }), t("Confirmed in writing")],
    [t("Sent on"), t("WhatsApp, you edit it first")],
  ];
  return (
    <>
      {/* structured data for search and answer engines (lib/structured-data.ts) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(estimateJsonLd(i))} />
      <header className="border-b border-line bg-surface">
        <SiteNav locale={locale} home={false} current="prices" other={locale === "en" ? "/ar/estimate" : "/estimate"} className="mx-auto" />

        <div className={`${wrap} grid gap-10 pb-12 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)] md:items-end md:gap-16 md:pb-16 md:pt-12`}>
          <div>
            <Link href={path("/#prices")} className="-ms-1 inline-flex min-h-11 items-center gap-2 px-1 text-sm font-bold text-ink/80 transition-colors hover:text-ink">
              <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
              {t("All prices")}
            </Link>
            <h1 className="mt-4 max-w-[16ch] font-heading text-[2.75rem] leading-[1.05] tracking-tight md:text-[4rem]">{t("Build your estimate.")}</h1>
            <p className="mt-5 max-w-[56ch] text-lg text-ink/80">
              {t("Pick a package, tick what you need and watch the total add up. Not sure where to start?")}{" "}
              <a href={wa(t(messages.starter))} {...ext} className="font-bold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:decoration-ink">
                {t("Start with Starter")}
              </a>
              .
            </p>
          </div>

          <dl className="border-t border-ink text-sm">
            {rules.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
                <dt className="text-ink/80">{k}</dt>
                <dd className="text-end font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main id="main" className={`${wrap} pb-16 pt-10 md:pb-28 md:pt-14`}>
        <section aria-labelledby="compare-title" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
          <div>
            <h2 id="compare-title" className="font-heading text-2xl md:text-3xl">
              {t("Compare two packages")}
            </h2>
            <p className="mt-1 max-w-[60ch] text-ink/80">{t("Tap any two to see only what changes between them, then take one into the estimate.")}</p>
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
            <Link href={path("/")} className="font-heading text-lg text-surface">
              {site.name}
            </Link>
            <span className="ms-3">{t("Working name, not yet registered")}</span>
          </p>
          <nav aria-label={t("Legal")} className="flex gap-5">
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-surface">
              {t(locale === "en" ? "Privacy" : "Privacy (English)")}
            </Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-surface">
              {t(locale === "en" ? "Terms" : "Terms (English)")}
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
