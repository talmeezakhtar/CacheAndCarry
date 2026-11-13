# Cache & Carry

Marketing site for Cache & Carry: websites and Google listings for small businesses in Sharjah and Dubai,
priced in the open, with every enquiry going to a pre-filled WhatsApp message. Next.js (App Router) and Tailwind.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # quote and estimate logic
npm run lint
npm run build   # production build
```

## Where things live

- `lib/site.ts`: every price, package, care plan, add-on, FAQ answer, WhatsApp message and the founding-offer count.
  Change prices here only; the tickets, comparison table, builder, terms and structured data all read from it.
- `lib/quote.ts`: totals, the written-quote rule (over AED 1,000 or more than 8 pages) and the WhatsApp estimate message.
- `app/page.tsx`: the home page. `app/terms` and `app/privacy`: legal pages.
- `PRODUCT.md`, `DESIGN.md`: who the site is for and how it looks. `LAUNCH-CHECKLIST.md`: what is still open.

## Before launch

- Set `NEXT_PUBLIC_SITE_URL` to the real domain (canonical, sitemap, robots and structured data use it).
- Replace `public/hero/hero.mp4` and `poster.jpg` with your own clip (see `LAUNCH-CHECKLIST.md`).
- Update `founding.left` in `lib/site.ts` each time a founding place is taken.
