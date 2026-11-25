import type { NextConfig } from "next";

// The site loads only its own files (fonts are self-hosted by next/font), so the policy can stay tight.
// Next's inline bootstrap and the JSON-LD need 'unsafe-inline'; dev mode also needs 'unsafe-eval'.
// Adding analytics or a third-party embed later means adding its host here.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()" },
  // HTTPS only, for two years, on this domain and its subdomains. Add "; preload" only once the domain is final:
  // the preload list is hard to leave.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // pages opened from here (WhatsApp, the demo sites) cannot reach back into this window
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // don't advertise the framework
  // browsers still ask for /favicon.ico; answer with the V&P icon instead of a 404
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/apple-icon" }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  cacheComponents: true,
  // two root layouts (English and /ar), so unmatched URLs get app/global-not-found.tsx
  experimental: { globalNotFound: true },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
