import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_DAYS, adminConfigured, checkPassword, newSession } from "@/lib/analytics/auth";

// Dashboard login: a form post from /admin/login. A wrong password waits a second before answering.
export async function POST(req: Request) {
  const back = (to: string) => new Response(null, { status: 303, headers: { Location: to } });
  if (req.headers.get("sec-fetch-site") && req.headers.get("sec-fetch-site") !== "same-origin") return new Response(null, { status: 403 });
  if (!adminConfigured()) return back("/admin/login?error=setup");

  const form = await req.formData();
  const password = String(form.get("password") ?? "").slice(0, 200);
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 1000));
    return back("/admin/login?error=1");
  }
  (await cookies()).set(SESSION_COOKIE, newSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  return back("/admin");
}
