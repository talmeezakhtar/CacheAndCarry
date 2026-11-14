import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { messages, wa } from "@/lib/site";
import { translate } from "@/lib/i18n";
import "./globals.css";

// With two root layouts (English and /ar) there is no single layout to build a 404 from, so this page stands alone
// (experimental.globalNotFound in next.config.ts). It cannot tell which language the visitor came from, so it says both.
const sans = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const serif = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["600"] });

export const metadata: Metadata = { title: "Page not found · Vibe & Pixel", robots: { index: false } };

export default function GlobalNotFound() {
  const ar = (k: string) => translate("ar", k);
  return (
    <html lang="en" dir="ltr" className={`${sans.variable} ${serif.variable} antialiased`}>
      <body className="font-sans text-base leading-normal">
        <main id="main" className="grid min-h-dvh place-items-center px-4 text-center">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl">This page is not here.</h1>
            <p lang="ar" dir="rtl" className="mt-3 text-xl text-ink/80">
              {ar("This page is not here.")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={wa(messages.general)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-ink px-6 font-bold text-surface">
                Chat on WhatsApp
              </a>
              <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-ink px-6 font-bold">
                Home page
              </Link>
              <Link href="/ar" lang="ar" className="inline-flex min-h-11 items-center rounded-full border border-ink px-6 font-bold">
                {ar("Home page")}
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
