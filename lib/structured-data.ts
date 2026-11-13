import { carePlans, faqs, packages, paymentTerms, site, wa, messages } from "@/lib/site";
import { QUOTE_THRESHOLD } from "@/lib/quote";
import type { I18n } from "@/lib/i18n";

/*
 * Structured data (schema.org JSON-LD) for search and answer engines, built from lib/site.ts so every price,
 * term and answer matches the page. One connected graph per page: the website, the business, what it sells
 * (build packages and monthly care plans), and the FAQ or a breadcrumb trail.
 * Only facts the site states: no street address (there are no premises), no ratings or reviews (none exist yet),
 * no founder name (the site does not name one).
 */

const abs = (path: string) => new URL(path, site.url).toString();
const ids = { website: abs("/#website"), business: abs("/#business") };

/** The website and the business, shared by every page. */
function core({ t, money, path, locale }: I18n) {
  const offer = (p: (typeof packages)[number]) => ({
    "@type": "Offer",
    name: t(p.label),
    // what it is, what is in it, and how it is paid (over AED 1,000 the price is confirmed in a written quote)
    description: [t(p.note), p.items.map((x) => t(x)).join(t("; ")), p.price > QUOTE_THRESHOLD ? t("Confirmed in a written quote.") : t(paymentTerms(p.label))]
      .map((x) => x.replace(/\.$/, ""))
      .join(". ")
      .concat("."),
    priceCurrency: "AED",
    // Store is a starting price
    ...("from" in p && p.from
      ? { priceSpecification: { "@type": "PriceSpecification", minPrice: p.price, priceCurrency: "AED" } }
      : { price: p.price }),
    url: abs(path(`/estimate?p=${p.label === "Starter" || p.label === "Business" ? p.label.toLowerCase() : "quote"}`)),
  });
  const plan = (p: (typeof carePlans)[number]) => ({
    "@type": "Offer",
    name: t(p.label),
    description: `${t(p.description)} ${p.items.map((x) => t(x)).join(t("; "))}.`,
    priceCurrency: "AED",
    priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: "AED", unitCode: "MON", unitText: t("a month") },
  });

  return [
    {
      "@type": "WebSite",
      "@id": ids.website,
      url: abs("/"),
      name: site.name,
      inLanguage: ["en", "ar"],
      publisher: { "@id": ids.business },
    },
    {
      "@type": "ProfessionalService",
      "@id": ids.business,
      name: site.name,
      url: abs(path("/")),
      logo: abs("/apple-icon"),
      image: abs("/opengraph-image"),
      description: t("English and Arabic websites for small businesses in Sharjah and Dubai."),
      telephone: site.phone,
      areaServed: [
        { "@type": "City", name: "Sharjah" },
        { "@type": "City", name: "Dubai" },
      ],
      knowsLanguage: ["en", "ar"],
      priceRange: `${money(packages[0].price)} – ${money(packages[packages.length - 1].price)}`,
      currenciesAccepted: "AED",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: site.phone,
        url: wa(t(messages.general)),
        availableLanguage: ["English", "Arabic"],
        areaServed: "AE",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: t("Prices"),
        itemListElement: [
          { "@type": "OfferCatalog", name: t("1. Build your site").replace(/^\d+\.\s*/, ""), itemListElement: packages.map(offer) },
          { "@type": "OfferCatalog", name: t("2. Keep it running").replace(/^\d+\.\s*/, ""), itemListElement: carePlans.map(plan) },
        ],
      },
      inLanguage: locale,
    },
  ];
}

const graph = (nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });

/** Homepage: website, business, and the FAQ as questions with answers. */
export const homeJsonLd = (i: I18n) =>
  graph([
    ...core(i),
    {
      "@type": "FAQPage",
      "@id": abs(`${i.path("/")}#faq`),
      inLanguage: i.locale,
      isPartOf: { "@id": ids.website },
      about: { "@id": ids.business },
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: i.t(f.q), acceptedAnswer: { "@type": "Answer", text: i.t(f.a) } })),
    },
  ]);

/** Price builder page: the page itself and its place in the site. */
export const estimateJsonLd = (i: I18n) =>
  graph([
    ...core(i),
    {
      "@type": "WebPage",
      "@id": abs(i.path("/estimate")),
      url: abs(i.path("/estimate")),
      name: i.t("Build your estimate · Cache & Carry"),
      description: i.t("Pick a website package, add what you need and see the total in AED, then send it to us on WhatsApp."),
      inLanguage: i.locale,
      isPartOf: { "@id": ids.website },
      about: { "@id": ids.business },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: site.name, item: abs(i.path("/")) },
          { "@type": "ListItem", position: 2, name: i.t("Prices"), item: abs(i.path("/#prices")) },
          { "@type": "ListItem", position: 3, name: i.t("Build your estimate.").replace(/\.$/, ""), item: abs(i.path("/estimate")) },
        ],
      },
    },
  ]);

/** JSON for a <script type="application/ld+json">, with "<" escaped so no text can close the tag early. */
export const jsonLdHtml = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
