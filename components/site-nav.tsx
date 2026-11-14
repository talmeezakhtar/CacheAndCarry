import Link from "next/link";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { i18n, type Locale } from "@/lib/i18n";
import { messages, wa } from "@/lib/site";

// Homepage sections, with a shorter label for phones. The WhatsApp button beside them is the contact.
// shortAr: a phone label only the Arabic needs, where the full words are longer than the English.
const links: { label: string; id: "work" | "how" | "prices" | "faq"; short?: string; shortAr?: string }[] = [
  { label: "Our work", id: "work", short: "Work" },
  { label: "How it works", id: "how", short: "Steps" },
  { label: "Prices", id: "prices" },
  { label: "FAQ", id: "faq", shortAr: "Questions" },
];

/**
 * The ink tab that hangs from the top edge of the page. On the homepage it sits over the hero and links to
 * its sections; on other pages (`home={false}`) it links back to them, adds the name as a home link from 640px,
 * and marks the section that page belongs to. The last link switches language: `other` is the same page in the
 * other language (defaults to its homepage).
 */
export function SiteNav({
  locale = "en",
  home = true,
  current,
  other,
  className = "",
}: {
  locale?: Locale;
  home?: boolean;
  current?: (typeof links)[number]["id"];
  other?: string;
  className?: string;
}) {
  const { t, path } = i18n(locale);
  const switchTo = locale === "en" ? { label: "العربية", short: "ع", lang: "ar", href: other ?? "/ar" } : { label: "English", short: "EN", lang: "en", href: other ?? "/" };
  return (
    <nav
      aria-label={t("Main")}
      className={`z-40 flex w-max max-w-[calc(100vw-1rem)] items-center gap-0.5 rounded-b-2xl bg-ink py-1.5 ps-2 pe-1.5 text-sm text-surface/80 md:gap-3 md:rounded-b-3xl md:ps-5 md:pe-2 ${className}`}
    >
      {!home && (
        <Link href={path("/")} className="flex min-h-11 shrink-0 items-center ps-2 pe-3 font-heading text-lg text-surface max-sm:hidden md:ps-0">
          Vibe &amp; Pixel
        </Link>
      )}
      {/* Only the links scroll on narrow screens; the WhatsApp button always stays in view. */}
      <div className="flex min-w-0 items-center overflow-x-auto [scrollbar-width:none] md:gap-3">
        {links.map(({ label, id, short: en, shortAr }) => {
          const short = locale === "ar" ? (shortAr ?? en) : en;
          return (
          <a
            key={id}
            href={home ? `#${id}` : path(`/#${id}`)}
            aria-current={current === id ? "page" : undefined}
            className="flex min-h-11 shrink-0 items-center px-1 underline-offset-[6px] transition-colors hover:text-surface sm:px-2 aria-[current=page]:text-surface aria-[current=page]:underline aria-[current=page]:decoration-sage-light aria-[current=page]:decoration-2"
          >
            {short && t(short) !== t(label) ? (
              <>
                <span className="sm:hidden">{t(short)}</span>
                <span className="max-sm:hidden">{t(label)}</span>
              </>
            ) : (
              t(label)
            )}
          </a>
          );
        })}
      </div>
      {/* Outside the scrolling links so it is always in view; a short label on phones. */}
      <a
        href={switchTo.href}
        data-event="lang_switch"
        data-to={switchTo.lang}
        lang={switchTo.lang}
        hrefLang={switchTo.lang}
        aria-label={switchTo.label}
        className="flex min-h-11 min-w-10 shrink-0 items-center justify-center px-1 font-bold text-surface transition-colors hover:text-sage-light sm:px-2"
      >
        <span className="sm:hidden" aria-hidden>{switchTo.short}</span>
        <span className="max-sm:hidden">{switchTo.label}</span>
      </a>
      <a
        href={wa(t(messages.general))}
        data-track="nav"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-surface px-4 font-bold text-ink transition-colors hover:bg-page"
      >
        <WhatsAppIcon className="size-4" />
        {t("WhatsApp")}
      </a>
    </nav>
  );
}
