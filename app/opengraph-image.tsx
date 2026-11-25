import { ImageResponse } from "next/og";
import { packages, site } from "@/lib/site";
import { aed } from "@/lib/quote";
import { BrandMark } from "@/components/brand-mark";

/*
 * The preview card shown when the site is shared (WhatsApp, X, LinkedIn, iMessage). Type only, no photo: the
 * launch checklist keeps photos out until a real, permitted one exists. Facts come from lib/site.ts so they stay in step.
 * One card for both languages: next/og's built-in font has no Arabic letters, so the Arabic pages share this one.
 */
export const alt = "Vibe & Pixel: websites for small businesses in Sharjah and Dubai, in English and Arabic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const facts = ["English & Arabic", `Live in ${site.delivery}`, `From ${aed(packages[0].price)}`];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f4f5f1", color: "#17211b", padding: "72px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <BrandMark size={72} radius={16} />
          <div style={{ fontSize: 36, fontWeight: 700 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>Websites for small businesses in Sharjah and Dubai.</div>
          <div style={{ fontSize: 30, color: "#454d48" }}>Prices on the page. Every enquiry on WhatsApp. You own the domain.</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {facts.map((f) => (
            <div key={f} style={{ display: "flex", padding: "12px 26px", borderRadius: 999, background: "#3f6b3a", color: "#fcfcfa", fontSize: 28, fontWeight: 700 }}>
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
