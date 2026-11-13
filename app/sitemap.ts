import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// PDF section 2. Each page lists its English and Arabic versions, so search engines pair them (hreflang).
// The privacy and terms pages are English only for now. lastModified is the build date: the site changes with each deploy.
const url = (path: string) => new URL(path, site.url).toString();
const pair = (en: string, ar: string, priority: number) =>
  [en, ar].map((path) => ({
    url: url(path),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority,
    alternates: { languages: { en: url(en), ar: url(ar), "x-default": url(en) } },
  }));

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pair("/", "/ar", 1),
    ...pair("/estimate", "/ar/estimate", 0.8),
    ...["/privacy", "/terms"].map((path) => ({ url: url(path), lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
