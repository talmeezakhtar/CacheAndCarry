"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useI18n } from "@/components/locale-provider";

/** Phones only: appears after the hero; hides over the work deck (its cards' own buttons sit in that corner) and the price builder (and its sticky total). */
export function FloatingWhatsApp({ href }: { href: string }) {
  const [show, setShow] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const seen: Record<string, boolean> = { hero: true };
    const hideOver = ["hero", "work", "builder"];
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen[e.target.id] = e.isIntersecting;
      setShow(!hideOver.some((id) => seen[id]));
    });
    for (const id of hideOver) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  if (!show) return null;
  return (
    <a
      href={href}
      data-track="floating"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("Chat on WhatsApp")}
      className="fixed bottom-4 end-4 z-30 grid size-14 place-items-center rounded-full bg-ink text-surface shadow-[0_12px_24px_-10px_rgb(23_33_27/0.6)] md:hidden"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
