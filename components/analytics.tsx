"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/client";
import { SECTIONS } from "@/lib/analytics/events";

/*
 * The site's own analytics (plan: lib/analytics). Mounted once in each root layout. Records:
 * - a page view, with the referring site and UTM tags when the visitor arrived from elsewhere;
 * - the first time each main section scrolls into view;
 * - every WhatsApp link click, named by the nearest data-track (which button) and data-package / data-plan;
 * - any element marked data-event="…", with its data-* details (ticket clicks, language switch, offer bar close);
 * - FAQ cards opened (details with data-tab).
 * No cookies, nothing typed into the builder, no personal data.
 */

const datasetOf = (el: Element | null) => (el instanceof HTMLElement ? el.dataset : {});

// one page view per page load, even if React runs the effect twice (development) or the component remounts
let lastView = "";
// sections already reported for the current page load (survives the effect re-running)
let reached = new Set<string>();

export function Analytics() {
  const pathname = usePathname();

  // page view + section reach, once per page
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const viewKey = `${pathname}|${performance.timeOrigin}`;
    const firstTime = viewKey !== lastView;
    lastView = viewKey;
    if (firstTime) reached = new Set();
    const fromElsewhere = document.referrer && new URL(document.referrer).host !== location.host ? new URL(document.referrer).host : undefined;
    const q = new URLSearchParams(location.search);
    const utm = { s: q.get("utm_source") ?? undefined, m: q.get("utm_medium") ?? undefined, c: q.get("utm_campaign") ?? undefined };
    if (firstTime) track("page_view", {}, { r: fromElsewhere, u: utm.s || utm.m || utm.c ? utm : undefined });

    const seen = reached;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = e.target.getAttribute("data-section") ?? e.target.id;
          if (e.isIntersecting && !seen.has(id)) {
            seen.add(id);
            track("section_reach", { section: id });
            io.unobserve(e.target);
          }
        }
      },
      // "reached" = the section crossed the middle of the screen; works for sections taller than the screen too
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id) ?? document.querySelector(`[data-section="${id}"]`);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [pathname]);

  // clicks and FAQ opens, for the whole page
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;
      const link = target.closest('a[href^="https://wa.me/"]');
      if (link) {
        const at = datasetOf(link.closest("[data-track]"));
        const pkg = datasetOf(link.closest("[data-package]")).package;
        const plan = datasetOf(link.closest("[data-plan]")).plan;
        track("whatsapp_click", { button: at.track ?? "other", package: pkg, plan });
        if (at.track === "builder_send") {
          const d = datasetOf(link);
          track("builder_send", { package: d.package, addons: Number(d.addons ?? 0), band: d.band, care: d.care, founding: d.founding === "true" });
        }
        return;
      }
      const marked = target.closest("[data-event]");
      if (marked instanceof HTMLElement) {
        const { event, ...details } = marked.dataset;
        if (event === "ticket_click" || event === "lang_switch" || event === "offer_close") track(event, details);
      }
    };
    // <details> toggle does not bubble, so listen in the capture phase
    const onToggle = (e: Event) => {
      const el = e.target;
      if (el instanceof HTMLDetailsElement && el.open && el.dataset.tab) track("faq_open", { tab: el.dataset.tab });
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("toggle", onToggle, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, []);

  return null;
}
