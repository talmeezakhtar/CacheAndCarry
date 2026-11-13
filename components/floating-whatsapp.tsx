"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

/** Phones only: appears after the hero, hides while the price builder (and its sticky total) is on screen. */
export function FloatingWhatsApp({ href }: { href: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen: Record<string, boolean> = { hero: true };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen[e.target.id] = e.isIntersecting;
      setShow(!seen.hero && !seen.builder);
    });
    for (const id of ["hero", "builder"]) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  if (!show) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-4 right-4 z-30 grid size-14 place-items-center rounded-full bg-ink text-surface shadow-[0_12px_24px_-10px_rgb(23_33_27/0.6)] md:hidden"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
