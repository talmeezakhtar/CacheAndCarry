import Link from "next/link";
import { site, wa } from "@/lib/site";

/** One numbered section of a legal page; the id doubles as the anchor in the contents list. */
export type LegalSection = { id: string; title: string; body: React.ReactNode };

/** Shared layout for /privacy and /terms: title, last-updated date, contents, numbered sections, contact. */
export function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: React.ReactNode; sections: LegalSection[] }) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-[760px] px-4 py-16 sm:px-6 md:py-24">
      <Link href="/" className="font-heading text-xl">
        {site.name}
      </Link>

      <h1 className="mt-12 font-heading text-4xl leading-[1.1] md:text-[3.25rem]">{title}</h1>
      <p className="mt-3 text-sm text-ink/80">Last updated {updated}</p>
      <div className="mt-8 space-y-4 text-lg leading-relaxed text-ink/90">{intro}</div>

      <nav aria-label="Contents" className="mt-10 rounded-2xl border border-line bg-surface p-6">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-accent">Contents</p>
        <ol className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="inline-flex min-h-8 items-center underline decoration-line underline-offset-4 hover:decoration-accent">
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 space-y-12">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-6">
            <h2 className="font-heading text-2xl md:text-3xl">
              {i + 1}. {s.title}
            </h2>
            <div className="legal-body mt-4 space-y-4 leading-relaxed text-ink/90 [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-16 border-t border-line pt-8">
        <p className="text-ink/80">Questions about this page? Message us and a real person will reply.</p>
        <a
          href={wa("Hi, I have a question about your privacy policy or terms.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-bold text-surface transition-colors hover:bg-ink/85"
        >
          WhatsApp {site.phone}
        </a>
        <p className="mt-8">
          <Link href="/" className="underline decoration-line underline-offset-4 hover:decoration-accent">
            Back to {site.name}
          </Link>
        </p>
      </footer>
    </main>
  );
}
