import type { Line } from "./quote";

// All site content and prices, from the project details PDF, confirmed in cache_carry_decisions_log.xlsx.
// Remaining open items (domain, trade name, accountant sign-off) are in LAUNCH-CHECKLIST.md.

// Founding places left: a live count, update by hand, remove the bar when the offer ends. Confirmed: 5 places at AED 199.
// The founding offer (decisions log #3): Starter at the launch price for the first 5 places, in return for a testimonial.
// "left" is a live count: update by hand, and remove the bar from app/page.tsx when it reaches 0.
export const founding = { price: 199, was: 299, left: 5, places: 5 };

export const site = {
  name: "Cache & Carry",
  // Set NEXT_PUBLIC_SITE_URL to the real domain before launch: canonical, sitemap, robots and structured data all use it.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cacheandcarry.ae", // fallback is a placeholder, availability not checked (PDF section 1)
  whatsapp: "971503482765", // digits only with country code (wa.me format)
  phone: "+971 50 348 2765", // the same number, written for people
  delivery: "5 working days", // confirmed delivery promise for Starter, counted from payment and content (decisions log #1, terms)
};

/** Build packages (PDF 6.2). Pro and Store are over AED 1,000, so they are quoted in writing. */
export const packages = [
  { label: "Starter", price: 299, pages: 1, note: "1 page, up to 5 sections", items: ["Hero, services, about, gallery and contact", "WhatsApp button and Google Maps"] },
  { label: "Business", price: 799, pages: 4, note: "Up to 4 pages", items: ["Home, about, services and contact", "Basic SEO setup"] },
  { label: "Pro", price: 1499, pages: 7, note: "Up to 7 pages", items: ["Basic SEO setup", "Google Business Profile setup", "One custom enquiry form, such as a quote request"] },
  { label: "Store", price: 2499, from: true, note: "Shopify or similar", items: ["Up to 20 products", "Payments, shipping zones and policy pages", "Larger stores quoted"] },
];

/** Payment terms (decisions log #6): Starter in full before work starts; every bigger build 50/50, the second half before go-live. */
export const paymentTerms = (label: string) =>
  label === "Starter" ? "Paid upfront" : "50% to start, 50% before go-live";

/** In every build package (PDF 6.2). */
export const included = ["mobile-friendly design", "WhatsApp button", "simple contact form", "Google Maps", "two revision rounds"];

/** Monthly care plans (PDF 6.5). */
export const carePlans = [
  { label: "Go Live", price: 69, description: "Keeps your site online, safe and up to date.", items: ["Hosting, SSL and domain renewal", "Uptime check", "1 small edit a month"] },
  { label: "Care+", price: 149, description: "For shops that change prices, photos or offers often.", items: ["Everything in Go Live", "4 small edits a month", "Monthly backup and speed check", "1 Google Business post"] },
  { label: "Growth", price: 449, description: "Regular Google posts, seasonal banners and a monthly report.", items: ["Everything in Care+", "8 small edits a month", "4 Google Business posts", "Seasonal banner and a short monthly report"] },
];

/** What a small edit is, published so plans stay fair both ways (PDF section 8). */
export const smallEdit = {
  inPlan: ["Text, prices or opening hours", "Swapping a photo", "Updating a phone number or link", "Turning a section on or off"],
  paid: ["A new section or page", "A new feature, form or integration", "Redesigning a section", "Seasonal campaigns, unless you are on Growth"],
};

/** Add-on menu (PDF 6.4), grouped for the price builder. `perPage` items take a page count. */
export type AddOn = Line & { group: string; perPage?: boolean; only?: string[] };
export const addOns: AddOn[] = [
  { group: "Pages and words", label: "Extra page", price: 149, perPage: true },
  { group: "Pages and words", label: "Arabic version, per page", price: 149, perPage: true },
  { group: "Pages and words", label: "We write your text, per page", price: 99, perPage: true },
  { group: "Pages and words", label: "Bigger photo gallery, up to 20 photos", price: 79 }, // Starter already has a small gallery section (PDF 6.4)
  { group: "Pages and words", label: "Menu or price list section", price: 99 },
  { group: "Features", label: "Instagram feed", price: 79 },
  { group: "Features", label: "Online booking", price: 149 },
  { group: "Features", label: "WhatsApp order form", price: 149 },
  { group: "Google, domain and email", label: "Google Business Profile setup", price: 149 },
  { group: "Google, domain and email", label: "Basic SEO setup", price: 149 },
  { group: "Google, domain and email", label: "Domain, .com, first year", price: 149 },
  { group: "Google, domain and email", label: "Domain, .ae, first year", price: 249 },
  { group: "Google, domain and email", label: "Business email setup", price: 99 },
  { group: "Extras", label: "Simple logo", price: 199 },
  { group: "Extras", label: "Rush delivery, 24 hours", price: 99, only: ["Starter"] }, // one page only: a bigger site cannot be built and reviewed in a day
  { group: "Extras", label: "Extra revision round", price: 49 },
];

/** Pre-filled WhatsApp messages (PDF section 5). The visitor can edit them before sending. */
export const messages = {
  general: "Hi, I'd like a website for my business. Could you tell me more?",
  // for owners who skip the builder: start from Starter, let us suggest the rest
  starter: "Hi, I'd like to start with the Starter package. Could you suggest what else my business needs?",
  package: (name: string) => `Hi, I'm interested in the ${name} package. Could you tell me more?`,
  plan: (name: string) => `Hi, I'm interested in the ${name} care plan. Could you tell me more?`,
  float: "Hi, I have a question about Cache & Carry.",
  founding: "Hi, I'd like one of the founding places: a Starter site for AED 199. Is one still free?",
};

export const wa = (text = messages.general) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

// Screenshots in public/work, 1600x900 home pages. Retake them if a site changes.
export const demos = [
  { name: "Wick & Web", summary: "Candle and gift shop, with a cart", url: "https://wick-and-web.vercel.app", image: "/work/wick-and-web.webp" },
  { name: "Kuru Kuru", summary: "Conveyor sushi restaurant and menu", url: "https://sushi-sigma-wheat.vercel.app", image: "/work/sushi.webp" },
  { name: "Tessara", summary: "Clothing store for the UAE, EN and AR", url: "https://tessara-gules.vercel.app", image: "/work/tessara.webp" },
];

// FAQ copy from PDF 4.8, plus the house rules customers most need before messaging.
// Payment, plan length and Arabic answers follow the decisions log (13 Nov 2026).
export const faqs = [
  { tab: "Domain", q: "Who owns the domain?", a: "You do. It is registered in your name and you hold the login." },
  { tab: "Edits", q: "What counts as an edit?", a: "Text, photos, prices, opening hours, links, or turning a section on or off. New pages and features are quoted." },
  { tab: "Start", q: "What do you need from me?", a: "Your shop name, logo, a few photos, opening hours and WhatsApp number. A Starter site goes live 5 working days after we have these and your payment." },
  { tab: "Arabic", q: "Who writes the Arabic?", a: "We prepare it, a native speaker checks it, and you approve it before it goes live. AED 149 per page." },
  { tab: "Payment", q: "How do I pay?", a: "Starter is paid upfront. Bigger sites are 50% to start and 50% before go-live. Every quote is in writing and valid for 7 days." },
  { tab: "Plans", q: "How long is the monthly plan?", a: "3 months minimum, then monthly. Cancel with 30 days' notice. Pay yearly and get 2 months free." },
  { tab: "Google", q: "Do you guarantee Google rankings or more customers?", a: "No. We set everything up properly and report each month. Nobody honest can promise rankings." },
  { tab: "Limits", q: "What don't you build?", a: "Custom apps and paid ads. Anything over AED 1,000 or 8 pages is quoted in writing first." },
];
