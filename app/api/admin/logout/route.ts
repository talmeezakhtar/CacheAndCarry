import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/analytics/auth";

export async function POST(req: Request) {
  if (req.headers.get("sec-fetch-site") && req.headers.get("sec-fetch-site") !== "same-origin") return new Response(null, { status: 403 });
  (await cookies()).delete(SESSION_COOKIE);
  return new Response(null, { status: 303, headers: { Location: "/admin/login" } });
}
