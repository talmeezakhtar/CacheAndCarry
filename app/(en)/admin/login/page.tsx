import { Suspense } from "react";
import type { Metadata } from "next";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = { title: "Log in · Analytics · Vibe & Pixel", robots: { index: false, follow: false } };

const errors: Record<string, string> = {
  "1": "That password is not right. Try again.",
  setup: "The dashboard is not set up yet: set ADMIN_PASSWORD (12+ characters, your own) and ADMIN_SESSION_SECRET (32+ characters) in .env.local or the host's environment settings, then restart.",
};

async function ErrorLine({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const text = error ? errors[error] : null;
  return text ? (
    <p role="alert" className="mt-4 rounded-lg bg-ochre-wash px-3 py-2 text-sm text-ink">
      {text}
    </p>
  ) : null;
}

export default function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <main
      id="main"
      className="grid min-h-dvh place-items-center px-4"
      style={{
        background:
          "radial-gradient(60% 55% at 12% 8%, #b9c79e 0%, transparent 60%), radial-gradient(50% 50% at 92% 20%, #e3c88f 0%, transparent 62%), radial-gradient(70% 60% at 70% 100%, #587245 0%, transparent 60%), #eef1e4",
      }}
    >
      <form
        action="/api/admin/login"
        method="post"
        className="w-full max-w-sm rounded-3xl bg-surface/40 p-8 shadow-[inset_0_1px_0_#fff,0_20px_52px_-25px_rgb(23_33_27/0.3)] backdrop-blur-xl"
      >
        <BrandMark size={48} radius={12} />
        <h1 className="mt-5 font-heading text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-ink/80">Vibe &amp; Pixel · owner only</p>
        <Suspense>
          <ErrorLine searchParams={searchParams} />
        </Suspense>
        <label className="mt-6 grid gap-1.5 text-sm font-bold">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            autoFocus
            maxLength={200}
            className="min-h-11 rounded-lg border border-line bg-surface/80 px-3 text-base font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <button type="submit" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink font-bold text-surface transition-colors hover:bg-ink/85 active:scale-[0.98]">
          Log in
        </button>
      </form>
    </main>
  );
}
