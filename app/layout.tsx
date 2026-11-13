import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// Same pairing as Tessara: Cormorant Garamond for headings, prices and totals; Manrope for everything else.
const sans = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const serif = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"] });

// PDF section 2. No og:image until a real hero photo is agreed; add hreflang once /ar/ exists.
const title = "Cache & Carry · Websites for small shops in Sharjah and Dubai";
const description =
  "Websites and Google listings for small shops in Sharjah and Dubai, in English and Arabic. Live in 5 working days, then kept up to date for a monthly fee.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website", siteName: site.name, url: "/" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#f4f5f1" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} antialiased`}>
      <body className="font-sans text-base leading-normal">{children}</body>
    </html>
  );
}
