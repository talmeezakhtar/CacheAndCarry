import { createHash, randomBytes } from "node:crypto";

/*
 * Counting visitors without knowing who they are. Server only.
 * A visitor ID is sha256(today's salt + IP + browser), cut to 16 hex characters. The salt is random, changes every
 * day and yesterday's is deleted, so the same person gets a new, unlinkable ID each day and the IP cannot be
 * recovered. The IP itself is never stored.
 */

export const newSalt = () => randomBytes(32).toString("hex");

export const visitorId = (salt: string, ip: string, userAgent: string) =>
  createHash("sha256").update(`${salt}|${ip}|${userAgent}`).digest("hex").slice(0, 16);

/** Crawlers, link previews, uptime checks and scripts: not people, so not counted. */
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|discord|skype|python|curl|wget|axios|node-fetch|go-http|java\/|httpclient|monitor|uptime|pingdom|scan/i;
export const isBot = (userAgent: string) => !userAgent || userAgent.length < 20 || BOT.test(userAgent);

export const deviceOf = (userAgent: string) =>
  /ipad|tablet|(android(?!.*mobile))/i.test(userAgent) ? "tablet" : /mobi|iphone|android/i.test(userAgent) ? "phone" : "desktop";

/** Today's date in the UAE (UTC+4), which is when the daily salt rolls over and how the dashboard counts days. */
export const dubaiDay = (now = new Date()) => new Date(now.getTime() + 4 * 3600_000).toISOString().slice(0, 10);
