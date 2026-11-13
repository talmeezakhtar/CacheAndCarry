import { i18n, type Locale } from "@/lib/i18n";

/*
 * FAQ as a card-index drawer (TACTILE UI, cut 4), adapted for Cache & Carry:
 * - plain server-rendered JSX instead of an innerHTML mount, so the answers are in the HTML (SEO, FAQPage)
 * - Moss Light tokens, one finish (the site has no dark mode), and the site fonts (Cormorant title, Manrope text)
 *   at reading sizes, instead of 100 KB of embedded base64 fonts and a monospace "typed" face
 * - native <details name>: one card open at a time, no JavaScript at all
 */

type Card = { tab: string; q: string; a: string };

const STATIONS = [0.04, 0.37, 0.7]; // tabs staggered along the top edge, as a filing clerk does

export function FaqDrawer({
  id,
  locale = "en",
  cards,
  title,
  lead,
  drawer,
  askNote,
  askLabel,
  askHref,
}: {
  id?: string;
  locale?: Locale;
  cards: readonly Card[];
  title: string;
  lead: string;
  drawer: string;
  askNote: string;
  askLabel: string;
  askHref: string;
}) {
  const n = cards.length;
  const { t } = i18n(locale);
  const no = (i: number) => `${t("Q.")}${String(i + 1).padStart(2, "0")}`;
  const external = /^https?:/.test(askHref);
  return (
    <section id={id} className="fq" aria-labelledby="fq-title">
      <style>{CSS}</style>
      <div className="fq-wrap">
        <header className="fq-head">
          <h2 className="fq-title" id="fq-title">{title}</h2>
          <p className="fq-lead">{lead}</p>
          {/* in the sticky head, so the way to ask stays in view while the cards scroll */}
          <div className="fq-ask">
            <p className="fq-note">{askNote}</p>
            <a className="fq-key" href={askHref} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {askLabel}
            </a>
          </div>
        </header>
        <div>
          <div className="fq-drawer">
            <div className="fq-tray">
              {cards.map((c, i) => (
                <details
                  key={c.q}
                  name="faq"
                  className="fq-card"
                  open={i === 0}
                  style={{ "--depth": n <= 1 ? 0 : (n - 1 - i) / (n - 1), "--tab-at": STATIONS[i % 3] } as React.CSSProperties}
                >
                  <summary className="fq-edge">
                    <span className="fq-tab" aria-hidden>{c.tab}</span>
                    <span className="fq-no" aria-hidden>{no(i)}</span>
                    <span className="fq-q">{c.q}</span>
                    <span className="fq-mark" aria-hidden />
                  </summary>
                  <div className="fq-face">
                    <p className="fq-a">{c.a}</p>
                    <p className="fq-filed" aria-hidden>{t("Filed under {tab} · {no}", { tab: c.tab, no: no(i) })}</p>
                  </div>
                </details>
              ))}
            </div>
            <div className="fq-front" aria-hidden>
              <span className="fq-holder"><span className="fq-holder-card">{drawer}</span></span>
              <span className="fq-pull" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FaqDrawer;

const CSS = `
.fq {
  /* drawer metal, tinted to the Moss Light page */
  --desk: var(--color-surface);
  --face: #e2e2d2;
  --face-hi: #efefe3;
  --face-lo: #cfd0bd;
  --well: #d3d4c1;
  --ink: var(--color-ink);
  --ink-2: rgb(23 33 27 / 0.8);
  --accent: var(--color-accent);
  --hl: rgb(255 255 255 / 0.85);
  --sh: 23 33 27;
  --sh-a: 0.22;
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --well-fill: linear-gradient(to bottom, color-mix(in oklab, var(--well) 86%, rgb(var(--sh))), var(--well) 55%);
  --raised: inset 0 1px 0 var(--hl), 0 0 0 1px rgb(var(--sh) / calc(var(--sh-a) * .35)), 0 1px 1.5px rgb(var(--sh) / calc(var(--sh-a) * 1.2)), 0 5px 12px -5px rgb(var(--sh) / var(--sh-a));
  --inset: inset 0 3px 3px -2px rgb(var(--sh) / calc(var(--sh-a) * 2.6)), inset 0 9px 12px -9px rgb(var(--sh) / calc(var(--sh-a) * 1.8)), inset 0 0 0 1px rgb(var(--sh) / calc(var(--sh-a) * .45)), inset 0 -1px 0 color-mix(in oklab, var(--hl) 60%, transparent), 0 1px 0 var(--hl);
  --noise: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.28 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  /* card stock and ribbon */
  --paper: #fbfaf3;
  --type: #17211b;
  --type-2: #4d5243;
  --rule: rgb(23 33 27 / 0.12);
  --rule-2: rgb(23 33 27 / 0.32);
  --fibre: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.55' numOctaves='3' seed='9' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .4 0 0 0 0 .42 0 0 0 0 .33 0 0 0 .1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E");
  --drop: rgb(23 33 27 / 0.28);
  --mono: var(--font-manrope), system-ui, sans-serif; /* was a typewriter face; the site text face reads better */

  container: fq / inline-size;
  interpolate-size: allow-keywords;
  background: var(--desk);
  color: var(--ink);
}
.fq *, .fq *::before, .fq *::after { box-sizing: border-box; }
.fq-head > *, .fq-card p, .fq-ask p { margin: 0; }

.fq-wrap {
  display: grid;
  grid-template-columns: minmax(0, .8fr) minmax(0, 1.35fr);
  gap: 40px clamp(40px, 6cqi, 96px);
  align-items: start;
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding: 64px 16px;
}
@media (min-width: 640px) { .fq-wrap { padding-inline: 24px; } }
@media (min-width: 768px) { .fq-wrap { padding-block: 112px; } }
.fq-head { position: sticky; top: 24px; padding-top: 34px; }
.fq-wrap { align-items: stretch; } /* the head's column spans the drawer's height, so sticky has room to work */
.fq-head { align-self: start; }
.fq-title { font-family: var(--font-cormorant), Georgia, serif; font-weight: 600; font-size: clamp(36px, 4cqi, 48px); line-height: 1.1; letter-spacing: -0.02em; text-wrap: balance; }
.fq-lead { margin-top: 18px; max-width: 36ch; font-size: 18px; color: var(--ink-2); text-wrap: pretty; }

.fq-drawer { position: relative; isolation: isolate; padding: 12px 12px 0; border-radius: 14px; background: var(--face); box-shadow: var(--raised); }
.fq-drawer::before { content: ''; position: absolute; inset: 0; z-index: -1; border-radius: inherit; background: var(--noise); opacity: .45; pointer-events: none; }
.fq-tray { display: grid; padding: 40px 12px 16px; border-radius: 9px 9px 4px 4px; background: var(--well-fill) var(--well); box-shadow: var(--inset); }

.fq-card {
  --shade: calc(var(--depth, 0) * 0.09);
  position: relative;
  margin-inline: calc(var(--depth, 0) * 5px);
  border-radius: 4px 4px 1px 1px;
  background: linear-gradient(rgb(40 46 30 / var(--shade)), rgb(40 46 30 / var(--shade))), var(--fibre), var(--paper);
  color: var(--type);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .95), inset 0 2px 0 rgb(0 0 0 / .05), 0 -1px 0 rgb(0 0 0 / .1), 0 -7px 10px -5px var(--drop);
  transition: transform 220ms var(--ease), box-shadow 220ms var(--ease);
}
.fq-card:first-child { box-shadow: inset 0 1px 0 rgb(255 255 255 / .95), 0 -1px 0 rgb(0 0 0 / .08); }
.fq-card:not([open]):hover { transform: translateY(-3px); }
.fq-card[open] {
  z-index: 2; margin-top: 9px; transform: translateY(-12px);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .95), 0 -5px 9px -5px var(--drop), 0 22px 30px -16px var(--drop), 0 2px 3px rgb(0 0 0 / .12);
}

.fq-edge {
  display: grid; grid-template-columns: 5.2ch minmax(0, 1fr) auto; align-items: baseline; column-gap: 12px;
  min-height: 44px; padding: 16px 18px 22px; list-style: none; cursor: pointer;
  font: 600 16px/24px var(--mono); border-radius: inherit; -webkit-tap-highlight-color: transparent;
}
.fq-edge::-webkit-details-marker { display: none; }
.fq-edge::marker { content: ''; }
.fq-edge:focus-visible { outline: 2px solid var(--accent); outline-offset: -5px; }
.fq-no { font-size: 12px; letter-spacing: .04em; color: var(--type-2); }
.fq-q { text-wrap: pretty; }
.fq-mark { width: 12px; height: 12px; align-self: center; position: relative; }
.fq-mark::before, .fq-mark::after { content: ''; position: absolute; left: 1px; right: 1px; top: 5.25px; height: 1.5px; background: var(--accent); }
.fq-mark::after { transform: rotate(90deg); transition: transform 220ms var(--ease); }
.fq-card[open] .fq-mark::after { transform: rotate(0deg); }

.fq-tab {
  position: absolute; bottom: 100%; inset-inline-start: calc(var(--tab-at, 0) * 100%); height: 19px; padding: 3px 11px 0;
  border-radius: 5px 5px 0 0;
  background: linear-gradient(rgb(40 46 30 / var(--shade)), rgb(40 46 30 / var(--shade))), var(--fibre), var(--paper);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .95), 0 -4px 7px -4px var(--drop);
  font: 600 11px/16px var(--mono); letter-spacing: .06em; text-transform: uppercase; color: var(--type-2);
  white-space: nowrap; pointer-events: none;
}

.fq-card::details-content { block-size: 0; overflow: clip; transition: block-size 320ms var(--ease), content-visibility 320ms allow-discrete; }
.fq-card[open]::details-content { block-size: auto; }
.fq-face {
  margin: -8px 18px 0; padding: 16px 0 22px calc(5.2ch + 12px);
  border-top: 3px double var(--rule-2);
  font: 400 16px/26px var(--mono);
  background: repeating-linear-gradient(to bottom, transparent 0 25px, var(--rule) 25px 26px) 0 20px / 100% calc(100% - 42px) no-repeat;
}
.fq-a { max-width: 60ch; }
.fq-filed { margin-top: 26px; font-size: 12px; letter-spacing: .06em; color: var(--type-2); text-align: end; }

.fq-front {
  display: grid; justify-items: center; gap: 10px; margin: 0 -12px; padding: 16px 0 18px;
  border-radius: 0 0 14px 14px;
  background: linear-gradient(to bottom, color-mix(in oklab, var(--face-hi) 70%, var(--face)), var(--face));
  box-shadow: inset 0 1px 0 var(--hl), inset 0 2px 0 rgb(var(--sh) / calc(var(--sh-a) * .6)), 0 -1px 0 rgb(var(--sh) / calc(var(--sh-a) * .9));
}
.fq-holder { display: block; padding: 3px; border-radius: 3px; background: linear-gradient(var(--face-lo), var(--face-hi)); box-shadow: 0 0 0 1px rgb(var(--sh) / calc(var(--sh-a) * 1.2)), 0 1px 0 var(--hl), inset 0 1px 1px rgb(0 0 0 / .25); }
.fq-holder-card { display: block; min-width: 132px; padding: 3px 12px 2px; border-radius: 1px; background: var(--fibre), var(--paper); box-shadow: inset 0 1px 2px rgb(0 0 0 / .25); font: 600 12px/16px var(--mono); letter-spacing: .08em; text-align: center; text-transform: uppercase; color: var(--type); }
.fq-pull { display: block; width: 108px; height: 22px; border-radius: 3px 3px 54px 54px / 3px 3px 22px 22px; background: var(--well-fill) var(--well); box-shadow: var(--inset); }

.fq-ask { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgb(23 33 27 / .16); }
.fq-note { max-width: 36ch; color: var(--ink-2); }
/* same as the site's other dark buttons */
.fq-key {
  display: inline-flex; align-items: center; min-height: 48px; padding: 0 28px; border-radius: 999px;
  font-weight: 700; color: #fcfcfa; text-decoration: none; background: var(--ink);
  transition: background-color 150ms var(--ease), transform 70ms var(--ease);
}
.fq-key:hover { background: rgb(23 33 27 / .85); }
.fq-key:active { transform: scale(.98); }
.fq-key:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

@container fq (max-width: 959px) {
  /* One column: the head's children join the grid so the ask block can drop below the drawer. */
  .fq-wrap { grid-template-columns: minmax(0, 1fr); row-gap: 0; }
  .fq-head { display: contents; }
  .fq-head > * { max-width: 640px; }
  .fq-wrap > div { margin-top: 40px; }
  .fq-ask { order: 1; margin-top: 28px; padding-top: 0; border-top: 0; }
}
@container fq (max-width: 559px) {
  .fq-drawer { padding: 8px 8px 0; }
  .fq-tray { padding: 34px 6px 12px; }
  .fq-card { margin-inline: calc(var(--depth, 0) * 3px); }
  .fq-edge { grid-template-columns: minmax(0, 1fr) auto; padding: 14px 14px 20px; font-size: 15px; line-height: 22px; }
  .fq-no { display: none; }
  .fq-tab { font-size: 10.5px; padding-inline: 8px; }
  .fq-face { margin-inline: 14px; padding-inline-start: 0; font-size: 15px; }
  .fq-front { margin-inline: -8px; }
  .fq-ask { align-items: stretch; }
  .fq-key { justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .fq-card, .fq-mark::after, .fq-key, .fq-card::details-content { transition: none; }
  .fq-card:not([open]):hover { transform: none; }
}
`;
