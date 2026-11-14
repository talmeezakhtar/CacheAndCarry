import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import GlassAnalytics, { type RangeData } from "@/components/admin/glass-analytics";
import { SESSION_COOKIE, validSession } from "@/lib/analytics/auth";
import { db, prune } from "@/lib/analytics/db";
import { loadDashboard } from "@/lib/analytics/queries";
import { insights } from "@/lib/analytics/insights";

// The private analytics dashboard (one password, ADMIN_PASSWORD). Never indexed; blocked in robots.txt.
export const metadata: Metadata = { title: "Analytics · Vibe & Pixel", robots: { index: false, follow: false } };

const RANGES = [7, 30, 90];

async function Dashboard() {
  await connection(); // private, live numbers: always rendered at request time, never prerendered
  if (!validSession((await cookies()).get(SESSION_COOKIE)?.value)) redirect("/admin/login");
  const sql = db();
  if (!sql)
    return (
      <Notice title="No database connected">
        Set <code>DATABASE_URL</code> in your host&rsquo;s environment settings (see <code>.env.example</code>), run <code>npm run db:setup</code> once, then
        reload this page.
      </Notice>
    );
  let ranges: RangeData[];
  try {
    await prune(sql);
    ranges = await Promise.all(
      RANGES.map(async (days) => {
        const d = await loadDashboard(sql, days);
        return { ...d, insights: insights(d) };
      }),
    );
  } catch (error) {
    console.error("[analytics] dashboard query failed", error instanceof Error ? error.message : error);
    return (
      <Notice title="The database could not be read">
        Check that <code>DATABASE_URL</code> is right and that <code>npm run db:setup</code> has been run. The website itself is not affected.
      </Notice>
    );
  }
  const generatedAt = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return <GlassAnalytics ranges={ranges} initialDays={30} generatedAt={`${generatedAt} (UAE)`} />;
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-page px-4">
      <div className="max-w-[52ch] rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-heading text-3xl">{title}</h1>
        <p className="mt-3 text-ink/80 [&_code]:rounded [&_code]:bg-sage-wash [&_code]:px-1">{children}</p>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="grid min-h-dvh place-items-center text-ink/80">Loading analytics…</p>}>
      <Dashboard />
    </Suspense>
  );
}
