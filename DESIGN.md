---
name: Vibe & Pixel
description: Websites and Google listings for small UAE businesses, priced in the open.
colors:
  page: "#f4f5f1"
  surface: "#fcfcfa"
  ink: "#17211b"
  accent: "#3f6b3a"
  line: "rgb(23 33 27 / 0.13)"
  sage-wash: "#eef1e4"
  sage-tint: "#dfe6cf"
  sage-light: "#b9c79e"
  ochre: "#c9a45c"
  ochre-deep: "#a07a2e"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "3.5rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-lead:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    letterSpacing: "0.12em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  gutter: "16px"
  gutter-wide: "24px"
  section: "64px"
  section-wide: "112px"
  container: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "0 32px"
    height: "48px"
  button-on-dark:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  card-selected:
    backgroundColor: "{colors.sage-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  receipt-panel:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "28px"
  badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  input:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  nav-tab:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "6px 8px 6px 20px"
---

# Design System: Vibe & Pixel

## Overview

**Creative North Star: "The Shopkeeper's Ledger"**

Everything on the site is honest, itemised and calm, like a well-kept shop ledger. Prices are printed, not hinted at. Packages are admission tickets, the estimate is a receipt, the FAQ is a drawer of index cards. Each device is a familiar paper object from a small business's counter, and each one exists to make something countable and checkable at a glance.

The palette is moss on clean paper, in the spirit of Tessara: a pale pearl page, near-white surfaces, deep green-black ink and a single moss accent. Headings, prices and totals are set in Cormorant Garamond, a calm editorial serif; every working word is Manrope, a clear, open sans. The same pairing as Tessara. The parts are tactile and friendly: pill buttons that press in, soft-cornered cards, shadows tinted with the ink colour rather than grey. Density is moderate, with generous section spacing so a phone reader never feels crowded.

The look rejects the flashy tech-startup register (neon, glows, purple gradients), stock-photo filler, and trust styling that implies proof the business does not yet have.

**Key Characteristics:**
- One light theme: pearl page, near-white surfaces, deep green-black ink, one moss accent.
- Cormorant Garamond (600) for headings and prices; Manrope for everything else.
- Paper metaphors as signature components: tickets, receipts, index cards.
- Pill buttons, 16px cards, ink-tinted soft shadows.
- Prices always visible, always itemised.

## Colors

A muted moss-and-paper palette with one olive accent and a warm ochre used only as a second voice in pricing.

### Primary
- **Olive Moss** (accent): links, ticks, the selected state's border and check, focus outlines, eyebrow labels, and the founding-offer bar. It marks "this is chosen / this is included".

### Secondary
- **Ochre** (ochre): the warm second voice in pricing, on the Pro ticket and the Growth care card, so the top tiers read differently from the green ones.
- **Deep Ochre** (ochre-deep): small marks for "quoted separately" (the minus icons), where green would wrongly suggest "included".

### Neutral
- **Pearl** (page): the page background and input fill.
- **Linen White** (surface): alternating sections, cards, and text on dark panels.
- **Moss Black** (ink): all text, primary buttons, the nav tab, the receipt panel and the footer.
- **Ledger Rule** (line): hairline borders and dividers.
- **Sage Wash** (sage-wash): the fill of a selected card or tile.
- **Sage Tint** (sage-tint): the "in your plan" panel and the Starter ticket; a stronger highlight than Sage Wash.
- **Light Sage** (sage-light): accents on dark panels (footer, focus rings on the receipt inputs) where Olive Moss would be too dark.

### Named Rules
**The One Green Rule.** Olive Moss means "chosen or included" and nothing else. Never use it for decoration or for paid extras.

**The Ink-Tinted Shadow Rule.** Shadows are tinted with Moss Black (rgb 23 33 27), never neutral grey or blue.

## Typography

**Display Font:** Cormorant Garamond (with Georgia), weights 500 and 600, normal and italic
**Body Font:** Manrope (with system-ui), variable 200 to 800

**Character:** Cormorant gives headings and prices an editorial, considered voice; Manrope keeps every label, list, button and paragraph clear on a phone. Cormorant has a small x-height, so the heading utility applies `font-size-adjust: ex-height 0.44` (about 10% larger) and lining figures (`lnum`) so prices read cleanly.

### Hierarchy
- **Display** (Cormorant 600, 2.25rem on phones to 3.5rem, line-height 1.1, tight tracking): section headings (h2), balanced wrapping.
- **Headline** (Cormorant 600, 1.875rem): sub-section headings such as "1. Build your site, once".
- **Title** (Cormorant 600, 1.25 to 1.5rem): card and panel titles, package names, prices in cards.
- **Body** (Manrope 400, 1rem, line-height 1.5): all running text; lead paragraphs at 1.125rem in ink at 80% opacity, max 62 to 65ch. FAQ questions Manrope 600, answers Manrope 400 on a 26px ruled line.
- **Label** (Manrope 700, 0.875rem, 0.12em tracking, uppercase): the occasional eyebrow above a heading, in Moss.
- **Small print** (Manrope, 0.875rem minimum for anything the visitor needs to read; 0.75rem only for badges and short labels).

In code the heading role is the `font-heading` utility (app/globals.css). The footer's big wordmark uses Manrope, since it needs heavy weights Cormorant does not have.

### Named Rules
**The Two Voices Rule.** Cormorant speaks (headings, prices, totals); Manrope works (everything else). Never set running text or small labels in Cormorant.

**The Printed Price Rule.** Every price and total is set in Cormorant 600 with lining, tabular figures. Unconfirmed prices keep their brackets, e.g. "AED [299]".

## Layout

Content sits in a centred 1200px container with a 16px gutter on phones and 24px from 640px up. Sections are spaced 64px apart on phones and 112px on desktop, with 64 to 80px between sub-sections; the gutter is 16px, 24px from 640px and 32px from 1024px. Sections alternate Pearl and Linen White to separate bands without lines. Multi-column layouts collapse to one column under 768px. Interactive tools pair a working column with a summary that stays in view: a sticky side panel on desktop, a docked bar at the bottom on phones. The hero is full-bleed; everything else respects the container.

## Elevation & Depth

Mostly flat, with soft lift reserved for things the visitor acts on or must keep in view. Depth comes first from tone (linen cards on sage, dark ink panels on light), then from long, soft, ink-tinted shadows with a negative spread.

### Shadow Vocabulary
- **Receipt** (`box-shadow: 0 24px 48px -24px rgb(23 33 27 / 0.55)`): the dark estimate panel.
- **Docked bar** (`box-shadow: 0 12px 32px -12px rgb(23 33 27 / 0.6)`): sticky total bar and floating buttons.
- **Card rest** (`box-shadow: 0 1px 2px rgb(23 33 27 / 0.05)`): optional, on highlighted info panels only.

## Shapes

Soft and consistent: 8px for inputs, 12px for small selectable tiles, 16px for cards and panels, full pill for every button, badge and toggle. Borders are 1px Ledger Rule at rest; a selected item switches to a 1px Olive Moss border plus Sage Wash fill. Paper components keep their own silhouettes: the ticket's notched stub, the index card's tab.

## Components

### Buttons
Tactile and friendly; they press in on click (scale 0.98).
- **Shape:** full pill (9999px).
- **Primary:** Moss Black fill, Linen White text, bold Manrope, 44 to 48px tall.
- **On dark:** Linen White fill with Moss Black text, inside ink panels and the footer.
- **Outline:** 1px Moss Black border, transparent; fills with ink on hover.
- **Focus:** 2px Olive Moss outline, 3px offset.

### Chips
- **Badge:** Olive Moss pill with Linen White bold text ("Best for a first site"); a translucent ink pill for "2 months free".
- **Toggle group:** pill track in Linen White; the active option is a Moss Black pill.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Linen White on the pearl page; Sage Wash when selected; Sage Tint for "included" highlights.
- **Shadow Strategy:** none at rest; see Elevation.
- **Border:** 1px Ledger Rule; 1px Olive Moss when selected, 2px for a highlighted rule panel.
- **Internal Padding:** 20px on cards, 24 to 32px on panels.

### Inputs / Fields
- **Style:** 44px tall, 8px corners, Pearl fill, 1px Ledger Rule border, label above in bold.
- **Focus:** border turns Olive Moss with a 2px soft olive ring.
- **On dark:** translucent white fill, Light Sage focus ring.

### Navigation
A Moss Black tab hanging from the top edge of the hero, rounded only at the bottom, with Manrope links in Linen White at 80% and a pill WhatsApp button. It scrolls away with the page; on phones only the links scroll sideways and the button stays.

### Signature: Admit-One Tickets
Build packages are shown as admission tickets with an animated dithered texture, one palette per tier (sage, deep olive, ochre, moss black), the price on the stub.

### Signature: Receipt Panel
The price builder's estimate: a dark ink panel listing each line with a remove button, the total in large Cormorant 600, and the WhatsApp action. Sticky on desktop, mirrored by a docked bar on phones.

### Signature: Index-Card Drawer
The FAQ: questions set in Manrope semibold on cream cards, answers in regular Manrope on a ruled face with staggered tabs in a sage-grey drawer; one card opens at a time.

## Do's and Don'ts

### Do:
- **Do** keep Moss (#3f6b3a) for chosen and included states, ticks and focus only.
- **Do** set prices and totals in Cormorant 600 (font-heading) with tabular numbers, brackets kept until confirmed.
- **Do** use pill buttons (9999px) and 16px cards everywhere; 8px only for inputs.
- **Do** tint every shadow with Moss Black (rgb 23 33 27).
- **Do** keep a summary in view for any tool with a running total (sticky panel or docked bar).

### Don't:
- **Don't** use neon, glows, purple or blue gradients, or "AI startup" styling.
- **Don't** fill space with generic stock photos of people at laptops; show the real sites.
- **Don't** add logo walls, star ratings, review counts or statistic styling until they are real.
- **Don't** use blue- or grey-tinted shadows; every shadow uses Moss Black (rgb 23 33 27).
- **Don't** use green for paid extras or "quoted separately" items; use Deep Ochre or neutral ink.
