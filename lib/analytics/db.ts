import postgres from "postgres";
import { newSalt, dubaiDay } from "./anon";
import type { CleanEvent } from "./events";

/*
 * The analytics database: Neon Postgres, reached through the pooled DATABASE_URL (`neon env pull` writes it; the
 * -pooler host, PgBouncer in transaction mode). Any other Postgres works too, without code changes. Without
 * DATABASE_URL the site works normally and simply records nothing. Schema setup uses the direct URL (scripts/db-setup.mjs).
 */

let client: postgres.Sql | null = null;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  // prepare: false keeps it compatible with connection poolers (Neon, Supabase, PgBouncer)
  client ??= postgres(url, { max: 3, idle_timeout: 20, connect_timeout: 10, prepare: false });
  return client;
}

const salts = new Map<string, string>();

/** Today's salt, creating it on first use; salts from before yesterday are deleted. */
export async function saltFor(sql: postgres.Sql, day = dubaiDay()) {
  const cached = salts.get(day);
  if (cached) return cached;
  await sql`insert into salts (day, salt) values (${day}, ${newSalt()}) on conflict (day) do nothing`;
  const [row] = await sql<{ salt: string }[]>`select salt from salts where day = ${day}`;
  await sql`delete from salts where day < ${day}::date - 1`;
  salts.clear();
  salts.set(day, row.salt);
  return row.salt;
}

/** Events from this visitor in the last hour, for the rate cap. */
export async function recentCount(sql: postgres.Sql, visitor: string) {
  const [row] = await sql<{ n: number }[]>`select count(*)::int as n from events where visitor = ${visitor} and ts > now() - interval '1 hour'`;
  return row.n;
}

export type Context = { visitor: string; device: string; country: string | null; region: string | null };

export async function insertEvent(sql: postgres.Sql, e: CleanEvent, c: Context) {
  await sql`
    insert into events (name, path, locale, referrer, utm_source, utm_medium, utm_campaign, device, country, region, visitor, props)
    values (${e.name}, ${e.path}, ${e.locale}, ${e.referrer}, ${e.utm.source}, ${e.utm.medium}, ${e.utm.campaign},
            ${c.device}, ${c.country}, ${c.region}, ${c.visitor}, ${sql.json(e.props)})`;
}

/** Keeps 13 months of events (privacy policy); run when the dashboard loads. */
export async function prune(sql: postgres.Sql) {
  await sql`delete from events where ts < now() - interval '13 months'`;
}
