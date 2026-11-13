import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Everything is public. AI search and answer crawlers are named explicitly so it is clear they are welcome
// (GEO: being quoted by ChatGPT, Claude, Perplexity, Gemini and Copilot). /llms.txt summarises the site for them.
const aiCrawlers = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }, { userAgent: aiCrawlers, allow: "/" }],
    sitemap: new URL("/sitemap.xml", site.url).toString(),
    host: new URL(site.url).host,
  };
}
