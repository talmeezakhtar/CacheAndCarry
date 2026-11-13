import { wa } from "@/lib/site";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <h1 className="font-heading text-4xl md:text-5xl">This page is not here.</h1>
        <a href={wa()} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-11 items-center rounded-full bg-ink px-6 font-bold text-surface">
          Chat on WhatsApp
        </a>
      </div>
    </main>
  );
}
