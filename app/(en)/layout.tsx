import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { LocaleProvider } from "@/components/locale-provider";
import { shareImage, site } from "@/lib/site";
import "../globals.css";

// Same pairing as Tessara: Cormorant Garamond for headings, prices and totals; Manrope for everything else.
const sans = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
// Only 600 is used (headings, prices); fewer weights means fewer font files to download.
const serif = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["600"] });

// PDF section 2. No og:image until a real hero photo is agreed. The Arabic site is at /ar (app/ar).
const title = "Cache & Carry · Websites for small shops in Sharjah and Dubai";
const description =
  "Websites and Google listings for small shops in Sharjah and Dubai, in English and Arabic. Starter sites live in 5 working days, then kept up to date for a monthly fee.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  applicationName: site.name,
  alternates: { canonical: "/", languages: { en: "/", ar: "/ar", "x-default": "/" } },
  openGraph: { title, description, type: "website", siteName: site.name, url: "/", locale: "en_AE", alternateLocale: "ar_AE", images: [shareImage] },
  twitter: { card: "summary_large_image", title, description, images: [shareImage] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f4f5f1" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className={`${sans.variable} ${serif.variable} antialiased`}>
      <body className="font-sans text-base leading-normal">
        {/* first Tab stop: jumps past the nav to the page content */}
        <a
          href="#main"
          className="fixed start-4 top-4 z-50 -translate-y-24 rounded-full bg-ink px-5 py-3 font-bold text-surface transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <LocaleProvider locale="en">{children}</LocaleProvider>
      </body>
    </html>
  );
}
