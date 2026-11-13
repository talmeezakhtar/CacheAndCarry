# Cache & Carry: launch checklist

Sources: `cache_carry_full_project_details.pdf` (17 pages; section numbers below point into it) and
`cache_carry_decisions_log.xlsx` (confirmed decisions, 13 Nov 2026). Prices live in `lib/site.ts` and `lib/quote.ts`;
`PRICES_CONFIRMED` is now `true`, so prices print without brackets.

## On the site now (from the PDF)

- Founding offer bar, dismissible (4.1).
- Hero copy with rotating words; reduced-motion users see "shop" only (4.3).
- Trust strip: 5 working days, starting price, Arabic too, you own it (4.4).
- How it works with Day 0 / Day 1 to 3 / By day 5. Step 2 says two rounds, matching the pricing rules (4.6).
- All five build packages, "in every package" list, three care plans and their rules (6.2, 6.5).
- Published definition of a small edit, in plan versus quoted (8).
- Price builder: Starter by default, 16 add-ons, care plan and first-year total, estimate kept in the page link; over AED 1,000 or 8 pages the figure stays and is confirmed in a written quote; nothing charged online (6.1, 6.9).
- Pre-filled WhatsApp messages per button and per plan (5).
- FAQ "Before you message us": ownership, edits, what we need, Arabic, payment, plan length, no guaranteed rankings, what we don't build (4.8, 9).
- Metadata, Open Graph, X card, theme colour, canonical, sitemap, robots, ProfessionalService and FAQPage structured data, no price markup (2).
- Footer copyright: "Working name, not yet registered" (2).
- WhatsApp number +971 50 348 2765 on every button (`site.whatsapp`).
- Confirmed terms on the site: Starter paid in full upfront, bigger builds 50/50, care plans 3-month minimum then monthly, prices excl. VAT with VAT as a separate quote line, Arabic AED 149 per page with client-approved translation.
- Privacy policy (`/privacy`) and terms of service (`/terms`), written from how the site and business actually work.

## Still to build

| What | Why | PDF |
| --- | --- | --- |
| Legal review of `/privacy` and `/terms` | Written in plain professional English; a UAE lawyer should review against the PDPL (Federal Decree-Law No. 45 of 2021) before launch. Confirm the policy commitments: 12-month deletion of enquiries, 90-day deletion after work ends, 30-day response to data requests, two-step sign-in on our accounts, 14-day late-payment pause, build refund rule | 2, 10 |
| Analytics with WhatsApp click events | Not chosen yet; event names are listed in section 4 | 2, 4 |
| Arabic version at `/ar/` with `dir="rtl"`, hreflang, sitemap entry | After the English site is finished; client approves each translation (decisions log #8) | 1, 2, 3 |
| Presence pack (AED 175) on the site | Confirmed to keep (decisions log #9): Google Business Profile, WhatsApp catalogue up to 10 items, photos, local search words; credited against a Starter within 60 days. Not on the site yet | 6.4 |
| Real hero photo (with written permission) and og:image | Placeholder only; no share image until then | 2, 4.3 |
| Favicon (C&C monogram) | Not designed | 2 |
| Domain | `cacheandcarry.ae` is a placeholder, availability not checked | 1, 12 |

## Decided (decisions log, 13 Nov 2026)

1. **Delivery**: 5 working days.
2. **Starter price**: AED 299.
3. **Founding offer**: AED 199 for the first 5 places.
4. **Care plans**: Go Live 69 / Care+ 149 / Growth 449.
5. **Care minimum term**: 3 months, then monthly; yearly prepay gives 2 months free. Cancel with 30 days' notice (from the PDF final draft).
6. **Payment terms**: Starter 100% upfront; bigger builds 50% to start, 50% before go-live.
7. **Partner commission**: 10% of the first build, paid after payment, no ongoing share (internal, not on the site).
8. **Arabic**: AED 149 per page.
9. **Presence pack**: keep (AED 175). Not on the site yet, see above.
10. **Pay-monthly Starter**: not offered.
11. **VAT**: prices exclude VAT; VAT is a separate line on quotes once registered.
12. **Validation gate**: 3 sample sites and 15 to 20 businesses per niche before any licence application.

## Still open (from the decisions log)

1. **Domain**: check `cacheandcarry.ae` (and `.com`) before printing or registering.
2. **Trade name and trademark**: search the UAE registers for "Cache & Carry". The footer keeps "Working name, not yet registered" until then.
3. **Accountant**: confirm the VAT wording, the 100% Starter rule and the 50/50 terms.
4. **Measure the first three Starter builds**: fix the template if any run past about 4.5 hours.
5. **Care+ review**: track take-up for 60 days; trim included edits rather than raise the price.
6. **Same-day reply**: the contact band says "We'll reply on WhatsApp" until someone can promise same day.

## Avoid

These would mislead customers or break the PDF's own rules.

- **Invented proof.** No client logos, ratings, review counts or statistics until real clients agree in writing (1, 4.5).
- **Changing prices in one place only.** Prices are confirmed and live in `lib/site.ts`; change them there so the tickets, comparison table, builder and terms stay in step.
- **Guaranteed outcomes.** No promises of rankings, leads or sales. We sell effort and reporting (9).
- **Promises we have not measured.** "Same-day reply", "48 hours" (4.9, 11).
- **Forms that collect personal data on this site.** Enquiries go through pre-filled WhatsApp only (1).
- **Custom apps, software, paid ad campaigns, AI-visibility add-ons.** Set aside for now (9).
- **Unsolicited follow-ups after a free listing check.** One message, public data only, opt-out line (9, 11).
- **Keeping a client's domain.** Always registered in the client's name, in writing (6.5, 8).
- **Stand-in hero video.** Decided: the hero keeps an autoplay video on every screen, phones included, overriding the PDF's "no autoplay video" target. For now `public/hero/hero.mp4` is a downloaded copy of the Prisma demo clip (16 MB, not ours to use, and off-brand per DESIGN.md), with `public/hero/poster.jpg` as a frame of it. Before launch, replace both with your own short, muted clip and a frame from it, compressed to about 2 to 3 MB, keeping the same file names. Reduced-motion visitors get the poster instead.
- **Review aids on the live site.** Structure-notes toggle and theme switcher must not ship (4.11). Neither is in this build.

### One conflict with an instruction you gave

The PDF says "Demo sites are fictional" and should be labelled as such (1, 4.5). You asked for the work section not to say demo or client, so it doesn't. **Settled:** the section now reads "Sites we designed", which is true of all three and does not present Wick & Web, Kuru Kuru or Tessara as paid client work. Revisit only if a real client site is added alongside them.
