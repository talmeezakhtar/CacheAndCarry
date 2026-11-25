import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/*
 * The dashboard's one login. The password lives only in ADMIN_PASSWORD (host settings); a successful login gets a
 * signed, httpOnly cookie that expires after 30 days. Visitors never get a cookie: this is for the owner only.
 */

export const SESSION_COOKIE = "vp_admin";
export const SESSION_DAYS = 30;

const sha = (s: string) => createHash("sha256").update(s).digest();

/** A password of 12+ characters that isn't the .env.example placeholder, and a 32+ character secret. */
export const adminConfigured = () => {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  return password.length >= 12 && !password.startsWith("REPLACE_WITH") && secret.length >= 32;
};

/** Compares in constant time (hashing first makes both sides the same length). */
export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !adminConfigured()) return false;
  return timingSafeEqual(sha(input), sha(expected));
}

const sign = (payload: string) => createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(payload).digest("base64url");

/** A session token: expiry time and its signature. */
export function newSession(now = Date.now()) {
  const expires = String(now + SESSION_DAYS * 86_400_000);
  return `${expires}.${sign(expires)}`;
}

export function validSession(token: string | undefined, now = Date.now()) {
  if (!token || !adminConfigured()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < now) return false;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(expires));
  return a.length === b.length && timingSafeEqual(a, b);
}
