# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Any small business in the UAE that needs a website or a better Google presence. The site leads with small shops in Sharjah and Dubai (cafés, salons, boutiques, restaurants), because that is where the first customers are expected, but the offer is not limited to them.

Typical situation: the owner runs the business day to day, has no web team and often no website yet, browses on a phone, and prefers to decide and talk over WhatsApp rather than fill in forms or book calls. They want to know what it costs, how long it takes, and that they will own what they pay for.

## Product Purpose

Cache & Carry builds websites and Google listings for small UAE businesses, in English and Arabic, then keeps them running for a monthly fee. The marketing site exists to let an owner see the work, understand the price and the rules, and start a conversation on WhatsApp with a pre-filled message.

Success: an owner reaches the site, understands what they would get and roughly what it costs, and sends a WhatsApp message.

## Positioning

Four things, together, set it apart from other web studios:

- **Prices shown upfront.** Fixed, published build packages and care plans, plus a live estimate. Anything over AED 1,000, or bigger than the published packages, is quoted in writing with every item listed.
- **Fast and WhatsApp-only.** Live in 5 working days (confirmed promise). Every enquiry, draft and change happens on WhatsApp; no forms collect personal data on the site.
- **The client owns everything.** Domain and content are registered in the client's name, always, in writing, and the client holds the login.
- **English and Arabic.** An Arabic version on request, drafted by the studio and checked by a native reviewer before it goes live.

## Operating Context

- Enquiries start from pre-filled WhatsApp messages (per button, per package, per care plan, and from the price builder). There is no contact form.
- Work follows three steps: the owner messages on WhatsApp (Day 0), reviews a first draft on their phone with two rounds of changes (Day 1 to 3), and goes live by day 5 with the domain, WhatsApp button and login handed over.
- After launch, care plans (Go Live, Care+, Growth) cover hosting, renewals and a monthly allowance of small edits. What counts as a small edit, versus quoted work, is published on the site.
- Source of truth for offer details: `cache_carry_full_project_details.pdf`, summarised in `LAUNCH-CHECKLIST.md`. Prices and copy live in `lib/site.ts` and `lib/quote.ts`.

## Capabilities and Constraints

- Build packages: Starter, Business, Pro, Store. Starter and Business are priced in the builder; Pro and Store are quoted.
- Care plans billed monthly, or yearly with two months free.
- 16 priced add-ons (pages, Arabic per page, copywriting, gallery, booking, domains, email, logo, rush delivery and more).
- Prices are confirmed (decisions log, 13 Nov 2026) and shown without brackets. Prices exclude VAT; VAT is a separate line on quotes once registered. Starter is paid in full upfront; bigger builds are 50% to start and 50% before go-live. Care plans have a 3-month minimum, then run monthly. Nothing is charged on the site.
- Not offered: custom apps or software, paid ad campaigns, AI-visibility add-ons, guaranteed rankings, leads or sales.
- Still open: domain, trade name and trademark, accountant sign-off on VAT and payment wording, same-day reply promise. See `LAUNCH-CHECKLIST.md`.
- Still to build: analytics, the `/ar/` Arabic site (after English is finished), the presence pack on the site, own hero clip and share image, favicon, domain. Privacy and terms are written and need a UAE legal review.

## Brand Commitments

- Name: Cache & Carry, a working name not yet registered (the footer says so).
- Run by a solo founder; the site speaks as "we" and does not name or picture the founder.
- Voice: plain and honest. Say what is included and what is not, keep open decisions visibly open, and never overstate.

## Evidence on Hand

- Three live sites designed by the studio: Wick & Web, Kuru Kuru and Tessara (`lib/site.ts`, screenshots in `public/work/`). They are not presented as paid client work; per the PDF they may be fictional demos, so never describe them as clients.
- No testimonials, client logos, ratings, review counts or statistics exist. Do not invent any until real clients agree in writing.
- The hero video is a stand-in hotlinked from another site and must be replaced with the studio's own clip before launch.

## Product Principles

1. **No surprises on price.** Show the number, show what it includes, and say plainly when something will be quoted instead.
2. **Never fake proof or promises.** No invented reviews, numbers, or guarantees; unmeasured claims stay out or stay bracketed.
3. **WhatsApp is the front door.** Every path ends in a pre-filled message the owner can edit; nothing collects data on the site.
4. **The owner stays in control.** Ownership, cancellation and what counts as an edit are stated up front.
5. **Phone first.** Most owners will read, compare and send from a phone.

## Accessibility & Inclusion

- WCAG AA contrast and keyboard access across the site; motion respects reduced-motion settings.
- Bilingual audience: English now, Arabic with right-to-left layout planned at `/ar/`.
