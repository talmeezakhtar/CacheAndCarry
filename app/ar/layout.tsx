import type { Metadata, Viewport } from "next";
import { Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import { LocaleProvider } from "@/components/locale-provider";
import { Analytics } from "@/components/analytics";
import { shareImage, site } from "@/lib/site";
import { translate } from "@/lib/i18n";
import "../globals.css";

// Arabic pairing in the same roles as the English one: Amiri, a calm book serif, for headings, prices and totals
// (the Cormorant role); IBM Plex Sans Arabic, clear on phones, for everything else (the Manrope role). Both carry
// Latin too, for the brand name and the demo site names. They load under the same CSS variables, so every
// component keeps its classes.
// preload: false because Next shares font declarations between the two root layouts and would otherwise preload
// every Arabic file on the English pages too. The fonts still load on /ar, where the text uses them (display: swap).
const sans = IBM_Plex_Sans_Arabic({ variable: "--font-manrope", subsets: ["arabic", "latin"], weight: ["400", "700"], preload: false });
const serif = Amiri({ variable: "--font-cormorant", subsets: ["arabic", "latin"], weight: ["700"], preload: false });

const t = (k: string) => translate("ar", k);
const title = t("Vibe & Pixel · Websites for small shops in Sharjah and Dubai");
const description = t(
  "Websites and Google listings for small shops in Sharjah and Dubai, in English and Arabic. Starter sites live in 5 working days, then kept up to date for a monthly fee.",
);

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  applicationName: site.name,
  alternates: { canonical: "/ar", languages: { en: "/", ar: "/ar", "x-default": "/" } },
  openGraph: { title, description, type: "website", siteName: site.name, url: "/ar", locale: "ar_AE", alternateLocale: "en_AE", images: [shareImage] },
  twitter: { card: "summary_large_image", title, description, images: [shareImage] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f4f5f1" };

export default function ArabicLayout({ children }: LayoutProps<"/ar">) {
  return (
    <html lang="ar" dir="rtl" className={`${sans.variable} ${serif.variable} antialiased`}>
      <body className="font-sans text-base leading-normal">
        <a
          href="#main"
          className="fixed start-4 top-4 z-50 -translate-y-24 rounded-full bg-ink px-5 py-3 font-bold text-surface transition-transform focus-visible:translate-y-0"
        >
          {t("Skip to content")}
        </a>
        <LocaleProvider locale="ar">{children}</LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
