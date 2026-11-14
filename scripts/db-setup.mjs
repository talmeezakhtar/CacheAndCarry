// Creates the analytics tables. Run once (safe to repeat): npm run db:setup
// Reads the database address from the environment or from .env.local. Schema changes use the direct connection
// (DATABASE_URL_UNPOOLED, written by `neon env pull`), as Neon recommends for migrations; the site itself uses the
// pooled DATABASE_URL. Without an unpooled address (another Postgres host) it falls back to DATABASE_URL.
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local (see .env.example) and run again.");
  process.exit(1);
}
const sql = postgres(url, { max: 1, prepare: false });
try {
  await sql.unsafe(await readFile(new URL("../db/schema.sql", import.meta.url), "utf8"));
  const [{ n }] = await sql`select count(*)::int as n from events`;
  console.log(`Analytics tables ready (${n} events stored).`);
} finally {
  await sql.end();
}
