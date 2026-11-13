import Link from "next/link";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { wa } from "@/lib/site";

// Homepage sections, with a shorter label for phones. The WhatsApp button beside them is the contact.
const links: { label: string; id: "work" | "how" | "prices" | "faq"; short?: string }[] = [
  { label: "Our work", id: "work", short: "Work" },
  { label: "How it works", id: "how", short: "Process" },
  { label: "Prices", id: "prices" },
  { label: "FAQ", id: "faq" },
];

/**
 * The ink tab that hangs from the top edge of the page. On the homepage it sits over the hero and links to
 * its sections; on other pages (`home={false}`) it links back to them, adds the name as a home link from 640px,
 * and marks the section that page belongs to.
 */
export function SiteNav({ home = true, current, className = "" }: { home?: boolean; current?: (typeof links)[number]["id"]; className?: string }) {
  return (
    <nav
      aria-label="Main"
      className={`z-40 flex w-max max-w-[calc(100vw-1rem)] items-center gap-1 rounded-b-2xl bg-ink py-1.5 pl-2 pr-1.5 text-sm text-surface/80 md:gap-3 md:rounded-b-3xl md:pl-5 md:pr-2 ${className}`}
    >
      {!home && (
        <Link href="/" className="flex min-h-11 shrink-0 items-center pl-2 pr-3 font-heading text-lg text-surface max-sm:hidden md:pl-0">
          Cache &amp; Carry
        </Link>
      )}
      {/* Only the links scroll on narrow screens; the WhatsApp button always stays in view. */}
      <div className="flex min-w-0 items-center overflow-x-auto [scrollbar-width:none] md:gap-3">
        {links.map(({ label, id, short }) => (
          <a
            key={id}
            href={home ? `#${id}` : `/#${id}`}
            aria-current={current === id ? "page" : undefined}
            className="flex min-h-11 shrink-0 items-center px-1.5 underline-offset-[6px] transition-colors hover:text-surface sm:px-2 aria-[current=page]:text-surface aria-[current=page]:underline aria-[current=page]:decoration-sage-light aria-[current=page]:decoration-2"
          >
            {short ? (
              <>
                <span className="sm:hidden">{short}</span>
                <span className="max-sm:hidden">{label}</span>
              </>
            ) : (
              label
            )}
          </a>
        ))}
      </div>
      <a
        href={wa()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-surface px-4 font-bold text-ink transition-colors hover:bg-page"
      >
        <WhatsAppIcon className="size-4" />
        WhatsApp
      </a>
    </nav>
  );
}
