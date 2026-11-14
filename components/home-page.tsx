import Link from "next/link";
import { ArrowRight, Check, Clock, KeyRound, Languages, Minus, Tag } from "lucide-react";
import { PrismaHero } from "@/components/ui/prisma-hero";
import { ProjectDeck } from "@/components/ui/scroll-stacking-cards";
import HowItWorks from "@/components/ui/how-it-works";
import DoodleCrewFooter from "@/components/ui/doodle-crew-footer";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { AnnouncementBar } from "@/components/announcement-bar";
import { PackageTickets } from "@/components/package-tickets";
import { FaqDrawer } from "@/components/ui/faq-drawer";
import Pricing6, { type Plan6 } from "@/components/ui/components-pricings-pricing-6";
import { carePlans, demos, faqs, founding, included, messages, packages, site, smallEdit, wa } from "@/lib/site";
import { SiteNav } from "@/components/site-nav";
import { i18n, type I18n, type Locale } from "@/lib/i18n";
import { homeJsonLd, jsonLdHtml } from "@/lib/structured-data";

const wrap = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8";
const band = "py-16 md:py-28"; // 64px on phones, 112px on desktop (Tessara-style breathing room)
const h2 = "font-heading text-4xl leading-[1.1] tracking-tight md:text-[3.5rem]";
const ext = { target: "_blank", rel: "noopener noreferrer" };

// Hero trust strip (PDF 4.4): the four worries answered before the work.
const trustFor = ({ t, money, path }: I18n) => [
  { title: t(site.delivery), body: t("Starter, once we have your content"), icon: Clock },
  // links straight to the estimate builder; shows the founding price while places are left
  founding.left > 0
    ? {
        title: t("From {price}", { price: money(founding.price) }),
        body: t(founding.left < founding.places ? "Founding price, {n} left" : "Founding price, {n} places", { n: founding.left }),
        href: path("/estimate?f=1"),
        icon: Tag,
      }
    : { title: t("From {price}", { price: money(packages[0].price) }), body: t("Fixed, published prices"), href: path("/estimate"), icon: Tag },
  { title: t("Arabic too"), body: t("On request"), icon: Languages },
  { title: t("You own it"), body: t("Domain in your name"), icon: KeyRound },
];

// How it works (PDF 4.6). Step 2 says two rounds, to match the pricing rules. The days are a Starter's, counted from
// payment and content as the terms say; bigger builds follow the timeline in their quote.
const steps = [
  { title: "Message us on WhatsApp", when: "Day 0", body: "Send your name, what you sell and a few photos. Day 0 is when we have these and your payment." },
  { title: "Review a first draft", when: "Day 1 to 3", body: "We send a draft. Two rounds of changes are included." },
  { title: "Go live", when: "By day 5", body: "We connect your domain and hand over the login. Bigger sites follow the timeline in your quote." },
];

// Care plans as pricing cards (PDF 6.5). Yearly = ten months' price for twelve (two months free).
const carePalettes: Plan6["palette"][] = ["sage", "olive", "ochre"];
const carePlan = ({ t, money }: I18n, p: (typeof carePlans)[number], yearly: boolean): Plan6 => {
  const i = carePlans.indexOf(p);
  return {
    id: `${p.label.toLowerCase().replace(/\W/g, "")}-${yearly ? "y" : "m"}`,
    name: t(p.label),
    description: t(p.description),
    palette: carePalettes[i],
    price: money(yearly ? p.price * 10 : p.price),
    originalPrice: yearly ? money(p.price * 12) : undefined,
    priceNote: t(yearly ? "a year" : "a month"),
    featuredLabel: yearly ? t("2 months free") : undefined,
    ctaLabel: t("Ask about {plan}", { plan: t(p.label) }),
    ctaHref: wa(t(messages.plan, { name: t(p.label) })),
    ctaDark: i === 1,
    trackPlan: p.label,
    features: p.items.map((f) => t(f)),
    // yearly is prepaid and not refunded for unused months (terms); monthly has the 3-month minimum
    footerNote: t(yearly ? "12 months, paid upfront" : "3-month minimum"),
    footerDesc: t(yearly ? "Unused months are not refunded." : "Then monthly. Cancel with 30 days' notice."),
  };
};


const Tick = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-3">
    <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
    <span>{children}</span>
  </li>
);

export function HomePage({ locale }: { locale: Locale }) {
  const i = i18n(locale);
  const { t, path } = i;
  const trust = trustFor(i);
  const jsonLd = homeJsonLd(i);
  const included_ = included.map((x) => t(x)).join(t(", "));
  return (
    <>
      {/* structured data for search and answer engines (lib/structured-data.ts) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />

      <main id="main">
        {/* 0 + 1 · Founding offer bar and hero share one screen: the hero fills whatever height the bar leaves,
            so the WhatsApp button stays in view however many lines the bar wraps to (or after it is closed). */}
        <div className="flex h-[100dvh] min-h-[600px] flex-col">
        <AnnouncementBar {...founding} href={wa(t(messages.founding, { price: i.money(founding.price) }))} />

        {/* Hero, with the nav tab hanging from its top edge (scrolls away with the page) */}
        <div className="relative min-h-0 flex-1">
          <SiteNav locale={locale} className="absolute left-1/2 top-0 -translate-x-1/2" />
          {/* TODO before launch: the hero clips are a temporary stand-in (the Prisma demo, not ours to keep).
              Replace hero.mp4 (1920px), hero-mobile.mp4 (1280px) and poster.jpg with your own; keep the file names.
              Encode: ffmpeg -i in.mp4 -an -c:v libx264 -preset veryslow -crf 20 -tune film -pix_fmt yuv420p -movflags +faststart [-vf scale=1280:-2] out.mp4 */}
          <PrismaHero
            video="/hero/hero.mp4"
            videoSmall="/hero/hero-mobile.mp4"
            poster="/hero/poster.jpg"
            whatsappHref={wa(t(messages.general))}
          />
        </div>
        </div>

        {/* 2 · Trust strip */}
        <section aria-label={t("What you can count on")} className="border-b border-line bg-surface">
          <ul className={`${wrap} grid grid-cols-2 md:grid-cols-4`}>
            {trust.map((item) => (
              <li
                key={item.title}
                className="flex flex-col items-start gap-2.5 border-line px-4 py-6 first:ps-0 sm:flex-row sm:items-center max-md:odd:ps-0 max-md:even:border-s max-md:[&:nth-child(n+3)]:border-t sm:gap-4 md:border-s md:first:border-s-0 md:ps-6"
              >
                <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-sage-soft text-accent sm:size-11">
                  <item.icon className="size-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-xl leading-tight">
                    {"href" in item ? (
                      <a href={item.href} className="underline decoration-accent decoration-2 underline-offset-4 hover:decoration-ink">
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-ink/80">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 3 · Work: the project deck */}
        <section id="work" className="pt-16 md:pt-28">
          <div className={wrap}>
            <h2 className={h2}>{t("Our work")}</h2>
            {/* "Sites we designed": true for every card, and never claims they are paid client work (LAUNCH-CHECKLIST) */}
            <p className="mt-3 text-lg text-ink/80">{t("Sites we designed. Open one and click around.")}</p>
          </div>
          <ProjectDeck projects={demos} />
        </section>

        {/* 4 · How it works */}
        <section id="how" className={`bg-surface ${band}`}>
          <div className={wrap}>
            <h2 className={`${h2} max-w-[20ch]`}>{t("Three steps to go live.")}</h2>
          </div>
          <HowItWorks className="mt-6" features={steps.map((s) => ({ title: t(s.title), description: t(s.body), note: t(s.when) }))} />
        </section>

        {/* 5 · Prices: build packages, care plans, what an edit is, then the builder */}
        <section id="prices" className={band}>
          <div className={wrap}>
            <h2 className={`${h2} max-w-[22ch]`}>{t("Build once, then keep it running.")}</h2>
            <p className="mt-4 text-lg text-ink/80">{t("All prices in AED.")}</p>

            <h3 className="mt-16 font-heading text-3xl md:mt-20">{t("1. Build your site")}</h3>
            <PackageTickets />
            <p className="mt-4 text-ink/80">
              <span className="font-bold text-ink">{t("Every package:")}</span> {included_.replace(/^./, (c) => c.toUpperCase())}.
            </p>

            <div className="mt-16 md:mt-20">
              <Pricing6
                title={t("2. Keep it running")}
                subtitle={t("Monthly, or yearly with 2 months free.")}
                firstLabel={t("Monthly")}
                secondLabel={t("Yearly")}
                groupLabel={t("Billing")}
                firstPlans={carePlans.map((p) => carePlan(i, p, false))}
                secondPlans={carePlans.map((p) => carePlan(i, p, true))}
              />
            </div>

            {/* Important rule, so it gets colour: sage for what's included, white for what's quoted. */}
            <h3 className="mt-16 font-heading text-3xl md:mt-20">{t("What counts as an edit")}</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-accent bg-sage-tint p-6 shadow-sm sm:p-8">
                <h4 className="font-heading text-2xl">{t("Included in your plan")}</h4>
                <ul className="mt-4 grid gap-2.5">
                  {smallEdit.inPlan.map((f) => (
                    <Tick key={f}>{t(f)}</Tick>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border-2 border-ink/15 bg-surface p-6 shadow-sm sm:p-8">
                <h4 className="font-heading text-2xl">{t("Quoted separately")}</h4>
                <ul className="mt-4 grid gap-2.5">
                  {smallEdit.paid.map((f) => (
                    <li key={f} className="flex gap-3">
                      <Minus aria-hidden className="mt-0.5 size-5 shrink-0 text-ochre-deep" />
                      <span>{t(f)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* The builder has its own page (/estimate), so this section stays a read; each ticket opens it with its package picked. */}
            <div className="mt-16 flex flex-col gap-6 rounded-2xl bg-ink p-6 text-surface shadow-[0_24px_48px_-24px_rgb(23_33_27/0.55)] sm:p-10 md:mt-20 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-heading text-3xl">{t("3. Build your estimate")}</h3>
                <p className="mt-2 max-w-[52ch] text-surface/80">
                  {t("Pick a package, tick the extras and see the total, then send it to us on WhatsApp. Not sure?")}{" "}
                  <a href={wa(t(messages.starter))} {...ext} data-track="starter_link" className="font-bold text-surface underline decoration-sage-light decoration-2 underline-offset-4 hover:decoration-surface">
                    {t("Start with Starter")}
                  </a>
                  .
                </p>
              </div>
              <Link
                href={path("/estimate")}
                className="group inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full bg-surface px-7 font-bold text-ink transition-colors hover:bg-white active:scale-[0.98] md:self-center"
              >
                {t("Open the price builder")}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 6 · FAQ: native details, one open at a time, answers in the HTML */}
        <FaqDrawer
          id="faq"
          locale={locale}
          cards={faqs.map((f) => ({ id: f.tab, tab: t(f.tab), q: t(f.q), a: t(f.a) }))}
          title={t("Before you message us.")}
          lead={t("Quick answers. Tap a card to open it.")}
          drawer={t("Vibe & Pixel · FAQ")}
          askNote={t("Still have a question?")}
          askLabel={t("Ask on WhatsApp")}
          askHref={wa(t(messages.general))}
        />

        {/* fixed on screen, but kept inside main so it belongs to a landmark */}
        <FloatingWhatsApp href={wa(t(messages.float))} />
      </main>

      <DoodleCrewFooter
        palette={{ background: "#17211b", ink: "#fcfcfa", accent: "#3f6b3a" }} /* ink, surface, accent: the footer draws with raw values */
        tagline={t("A Starter site online in {delivery}.", { delivery: t(site.delivery) })}
        blurb={t("Websites for small businesses in Sharjah and Dubai, in English and Arabic. Built by one studio, with a real person on WhatsApp.")}
        copyright={`© ${site.name}`}
        columns={[
          { title: t("Our work"), links: demos.map((d) => ({ label: d.name, href: "#work" })) },
          { title: t("Help"), links: [{ label: t("How it works"), href: "#how" }, { label: t("Prices"), href: "#prices" }, { label: t("FAQ"), href: "#faq" }] },
          {
            title: t("Company"),
            links: [
              { label: t("WhatsApp"), href: wa(t(messages.general)) },
              locale === "en" ? { label: "العربية", href: "/ar" } : { label: "English", href: "/" },
            ],
          },
        ]}
        legal={
          locale === "en"
            ? [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }]
            : [{ label: t("Privacy (English)"), href: "/privacy" }, { label: t("Terms (English)"), href: "/terms" }]
        }
        actions={[
          { label: t("See our work"), href: "#work", icon: "star", variant: "outline" },
          { label: t("Chat on WhatsApp"), href: wa(t(messages.general)), icon: "plane", variant: "solid" },
        ]}
      />
    </>
  );
}
