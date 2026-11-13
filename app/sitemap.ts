import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// PDF section 2. Add /ar/ here once the Arabic version is live.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/estimate", "/privacy", "/terms"].map((path) => ({ url: new URL(path, site.url).toString() }));
}
