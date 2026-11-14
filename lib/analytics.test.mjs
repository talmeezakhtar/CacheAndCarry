// Run: node lib/analytics.test.mjs (part of npm test). Checks the privacy and safety rules of the analytics.
import assert from "node:assert/strict";
import { clean, bandOf, LIMITS } from "./analytics/events.ts";
import { visitorId, isBot, deviceOf, dubaiDay, newSalt } from "./analytics/anon.ts";
import { insights, MIN } from "./analytics/insights.ts";
import { checkPassword, newSession, validSession } from "./analytics/auth.ts";

// ---- events: only the known vocabulary gets through ----
const ok = clean({ n: "whatsapp_click", p: "/ar/estimate?p=business&a=simple-logo", l: "ar", r: "www.Instagram.com", u: { s: "Instagram", c: "eid sale!" }, d: { button: "builder_send", package: "Business", name: "Ahmed", phone: "0501234567" } });
assert.equal(ok.name, "whatsapp_click");
assert.equal(ok.path, "/ar/estimate", "query strings are dropped");
assert.equal(ok.locale, "ar");
assert.equal(ok.referrer, "instagram.com", "referrer is the domain only, without www");
assert.deepEqual(ok.utm, { source: "instagram", medium: null, campaign: "eidsale" });
assert.deepEqual(ok.props, { button: "builder_send", package: "Business" }, "unknown details (name, phone) are dropped");

assert.equal(clean({ n: "steal_data", p: "/", l: "en" }), null, "unknown events are rejected");
assert.equal(clean({ n: "page_view", p: "https://evil.example/", l: "en" }), null, "paths must start with /");
assert.equal(clean(null), null);
assert.equal(clean([]), null);
assert.deepEqual(clean({ n: "whatsapp_click", p: "/", l: "en", d: { button: "<script>" } }).props, {}, "values outside the allowlist are dropped");
assert.deepEqual(clean({ n: "builder_send", p: "/estimate", l: "en", d: { addons: 3.4, founding: true, band: "over_1000" } }).props, { addons: 3, founding: true, band: "over_1000" });
assert.deepEqual(clean({ n: "builder_send", p: "/estimate", l: "en", d: { addons: 1e9 } }).props, {}, "absurd numbers are dropped");
assert.equal(clean({ n: "page_view", p: "/", l: "fr" }).locale, "en");
assert.equal(clean({ n: "page_view", p: "/", l: "en", r: "javascript:alert(1)" }).referrer, null);
assert.ok(LIMITS.body <= 4096);

assert.equal(bandOf(null), "quoted");
assert.equal(bandOf(299), "under_500");
assert.equal(bandOf(1000), "500_1000");
assert.equal(bandOf(1001), "over_1000");

// ---- anonymity: the daily ID changes with the salt and never contains the IP ----
const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
const a = visitorId("salt-day-1", "94.200.1.2", ua);
assert.equal(a.length, 16);
assert.equal(a, visitorId("salt-day-1", "94.200.1.2", ua), "same day, same person: same ID");
assert.notEqual(a, visitorId("salt-day-2", "94.200.1.2", ua), "next day: a different, unlinkable ID");
assert.ok(!a.includes("94"), "the IP is not in the ID");
assert.notEqual(newSalt(), newSalt());
assert.equal(dubaiDay(new Date("2026-11-14T21:30:00Z")), "2026-11-15", "days roll over at midnight UAE time");

assert.ok(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"));
assert.ok(isBot("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)"));
assert.ok(isBot("WhatsApp/2.23.20.0"), "link previews are not visitors");
assert.ok(isBot(""));
assert.ok(!isBot(ua));
assert.equal(deviceOf(ua), "phone");
assert.equal(deviceOf("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15"), "desktop");
assert.equal(deviceOf("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)"), "tablet");

// ---- insights: quiet without enough data, specific with it ----
const empty = { current: { visitors: 5, clickers: 1, builderSends: 0 }, previous: { visitors: 0, clickers: 0 }, funnel: { reachedPrices: 0, openedBuilder: 0, sentBuilder: 0 }, clicksByButton: [], clicksByPackage: [], builderBands: [], locales: [], devices: [], sources: [], faqs: [], offerCloses: 0 };
const few = insights(empty);
assert.equal(few.length, 1);
assert.match(few[0].title, new RegExp(`Not enough visits yet .*${MIN}`));

const busy = insights({
  ...empty,
  current: { visitors: 200, clickers: 20, builderSends: 6 },
  previous: { visitors: 180, clickers: 36 },
  funnel: { reachedPrices: 120, openedBuilder: 10, sentBuilder: 6 },
  clicksByPackage: [{ key: "Business", n: 18 }, { key: "Starter", n: 6 }],
  locales: [{ locale: "en", visitors: 140, clickers: 18 }, { locale: "ar", visitors: 60, clickers: 2 }],
});
const titles = busy.map((i) => i.title).join(" | ");
assert.match(titles, /click rate fell from 20% to 10%/);
assert.match(titles, /Arabic visitors message you less/);
assert.match(titles, /open the price builder/);
assert.match(titles, /Business brings 75% of package enquiries/);

// ---- dashboard login ----
process.env.ADMIN_PASSWORD = "correct horse battery staple";
process.env.ADMIN_SESSION_SECRET = "x".repeat(64);
assert.ok(checkPassword("correct horse battery staple"));
assert.ok(!checkPassword("correct horse battery stapl"));
assert.ok(!checkPassword(""));
const token = newSession(1_000);
assert.ok(validSession(token, 2_000));
assert.ok(!validSession(token, 1_000 + 31 * 86_400_000), "sessions expire after 30 days");
assert.ok(!validSession(token.replace(/.$/, (ch) => (ch === "A" ? "B" : "A")), 2_000), "a tampered cookie is rejected");
assert.ok(!validSession("9999999999999.forged", 2_000));
process.env.ADMIN_SESSION_SECRET = "short";
assert.ok(!checkPassword("correct horse battery staple"), "a weak secret keeps the dashboard closed");

console.log("analytics ok");
