import { clean, LIMITS } from "@/lib/analytics/events";
import { db, insertEvent, recentCount, saltFor } from "@/lib/analytics/db";
import { deviceOf, isBot, visitorId } from "@/lib/analytics/anon";

/*
 * Analytics collector. The browser posts one event (lib/analytics/client.ts); this checks it and stores it.
 * Always answers 204 for anything it chooses not to store (bots, no database, rate cap), so it never tells a
 * scraper what it filtered. Rejects only requests that are plainly not from this site.
 */

const nothing = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  // same-origin only: the browser marks where the request came from
  const site = req.headers.get("sec-fetch-site");
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (site ? site !== "same-origin" : origin && host && new URL(origin).host !== host) return new Response(null, { status: 403 });

  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > LIMITS.body) return new Response(null, { status: 413 });
  const text = await req.text();
  if (text.length > LIMITS.body) return new Response(null, { status: 413 });

  const userAgent = req.headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return nothing();

  let event;
  try {
    event = clean(JSON.parse(text));
  } catch {
    event = null;
  }
  if (!event) return new Response(null, { status: 400 });

  const sql = db();
  if (!sql) return nothing();

  try {
    // the IP is used for this one hash and then dropped; it is never stored
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "0.0.0.0";
    const visitor = visitorId(await saltFor(sql), ip, userAgent);
    if ((await recentCount(sql, visitor)) >= LIMITS.perHour) return nothing();
    const country = req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? null;
    const region = req.headers.get("x-vercel-ip-country-region") ?? null;
    await insertEvent(sql, event, { visitor, device: deviceOf(userAgent), country: country?.slice(0, 4) ?? null, region: region?.slice(0, 8) ?? null });
  } catch (error) {
    // analytics must never break the site; log for the owner, answer as normal
    console.error("[analytics] could not store event", error instanceof Error ? error.message : error);
  }
  return nothing();
}
