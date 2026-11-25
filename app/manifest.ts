import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Web app manifest: name, colours and icons when the site is saved to a phone's home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} · Websites for small businesses in Sharjah and Dubai`,
    short_name: site.name,
    description: "Websites and Google listings for small businesses in Sharjah and Dubai, in English and Arabic.",
    start_url: "/",
    display: "browser",
    background_color: "#f4f5f1",
    theme_color: "#f4f5f1",
    lang: "en",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
