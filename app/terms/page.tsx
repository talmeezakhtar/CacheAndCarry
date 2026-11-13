import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { QUOTE_THRESHOLD, PAGE_LIMIT, aed } from "@/lib/quote";
import { addOns, carePlans, founding, site } from "@/lib/site";

// Terms of service built from the confirmed decisions log (13 Nov 2026) and the project details PDF:
// payment (#6), care minimum (#5), delivery (#1), VAT (#12), Arabic (#8), founding offer (#3), small-edit definition (PDF 8),
// revisions and domain ownership (PDF 6). Prices come from lib/site.ts, so they stay in step with the rest of the site.
// Have a UAE lawyer review before launch.
export const metadata: Metadata = {
  title: "Terms of service | Cache & Carry",
  description: "The terms for website builds and monthly care plans from Cache & Carry: quotes, payment, delivery, revisions, ownership and cancellation.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "13 November 2026";
const extraRound = addOns.find((a) => a.label === "Extra revision round")?.price ?? null;
const [goLive, carePlus, growth] = carePlans;

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <>
        <p>
          These terms apply to every website, Google listing and care plan that {site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides to you (&ldquo;you&rdquo;,
          the business we work for). Your written quote sets out what we will deliver and the price; these terms set out how we work.
        </p>
        <p>You accept these terms when you accept a quote from us and make the first payment. If a quote and these terms disagree, the quote applies.</p>
      </>
    ),
  },
  {
    id: "quotes",
    title: "Quotes and prices",
    body: (
      <ul>
        <li>All prices are in UAE dirhams (AED) and exclude VAT. Where VAT applies, it is shown as a separate line on your quote and invoice.</li>
        <li>Every quote is in writing, lists each item and is valid for 7 days.</li>
        <li>
          Projects over {aed(QUOTE_THRESHOLD)}, sites of more than {PAGE_LIMIT} pages and anything not on our published price list are always quoted in writing
          before work starts.
        </li>
        <li>The estimate on our website is a guide. Your written quote is the final price. Nothing is charged on this website.</li>
      </ul>
    ),
  },
  {
    id: "payment",
    title: "Payment",
    body: (
      <>
        <ul>
          <li>
            <strong>Starter:</strong> paid in full before work starts.
          </li>
          <li>
            <strong>Business, Pro, Store and other larger builds:</strong> 50% to start, and the remaining 50% before the site goes live.
          </li>
          <li>
            <strong>Care plans:</strong> paid monthly in advance, or yearly in advance, where twelve months cost the price of ten.
          </li>
        </ul>
        <p>We publish your site and hand over its login once the build is paid in full.</p>
      </>
    ),
  },
  {
    id: "delivery",
    title: "Timeline and what we need from you",
    body: (
      <>
        <p>
          A Starter site goes live within {site.delivery} of us receiving both your payment and everything we need: your business name, logo if you have one,
          photos, text or the details for us to write it, prices, opening hours and WhatsApp number. Larger builds follow the timeline in your quote.
        </p>
        <p>
          If content arrives late or changes after we start, the timeline moves by the same amount. If we have not heard from you for 30 days, we may pause the
          project until you are ready to continue.
        </p>
      </>
    ),
  },
  {
    id: "revisions",
    title: "Revisions",
    body: (
      <p>
        Every build includes two rounds of changes to the first draft. Further rounds cost {aed(extraRound)} each. New pages, new features or a different
        design direction after approval are quoted separately.
      </p>
    ),
  },
  {
    id: "your-content",
    title: "Your content and responsibilities",
    body: (
      <ul>
        <li>You confirm you own, or have permission to use, everything you send us: text, photos, logos, product names and prices.</li>
        <li>You are responsible for the accuracy of your prices, opening hours, offers and claims, and for holding any licences your business needs.</li>
        <li>We may decline content that is unlawful, misleading or infringes someone else&rsquo;s rights.</li>
        <li>
          If you order an Arabic version ({aed(addOns.find((a) => a.label === "Arabic version, per page")?.price ?? null)} per page), we prepare the translation and you approve it before it goes live.
        </li>
      </ul>
    ),
  },
  {
    id: "ownership",
    title: "Ownership",
    body: (
      <ul>
        <li>Your domain is always registered in your name, and you hold its login.</li>
        <li>You own the content you supply. Once the build is paid in full, you own the website we made for your business.</li>
        <li>
          Fonts, plugins, themes, stock images and platforms such as Shopify remain the property of their makers and are used under their own licences, which we
          set up in your name where possible.
        </li>
        <li>While you are on a care plan we keep administrator access to do the work. You can ask us to remove it at any time.</li>
        <li>
          We may show your finished site in our portfolio and quote your testimonial only with your agreement. Founding-offer clients agree to this as part of
          that offer.
        </li>
      </ul>
    ),
  },
  {
    id: "care-plans",
    title: "Care plans",
    body: (
      <>
        <p>
          Care plans start when your site goes live. Each plan includes hosting, SSL, domain renewal and an uptime check, plus a monthly allowance of small edits:{" "}
          {goLive.label} ({aed(goLive.price)} a month) includes 1, {carePlus.label} ({aed(carePlus.price)}) includes 4, and {growth.label} ({aed(growth.price)})
          includes 8. Unused edits do not carry over to the next month.
        </p>
        <p>
          <strong>A small edit</strong> is a text change, a photo swap, updated prices or opening hours, a new phone number or link, or turning a section on or
          off. New sections or pages, new features, forms or integrations, redesigns and seasonal campaigns (outside Growth) are quoted separately.
        </p>
        <ul>
          <li>Every plan has a 3-month minimum and then continues month to month.</li>
          <li>After the minimum, you can cancel with 30 days&rsquo; notice on WhatsApp. Yearly payments are not refunded for unused months.</li>
          <li>If you host the site yourself, or have no plan, each change is quoted and billed separately.</li>
          <li>If a care payment is more than 14 days late, we may pause edits and, after a further reminder, hosting.</li>
        </ul>
      </>
    ),
  },
  {
    id: "founding-offer",
    title: "Founding offer",
    body: (
      <p>
        The founding offer is a Starter site for {aed(founding.price)} instead of {aed(founding.was)}, for the first {founding.places} businesses only, in return for a written testimonial and
        permission to show the site in our work. All other terms apply as normal. The offer ends when the places are taken.
      </p>
    ),
  },
  {
    id: "cancellation",
    title: "Cancelling a build",
    body: (
      <>
        <p>
          You can cancel a build by telling us on WhatsApp. If no work has started, we refund what you paid. Once work has started, payments already made cover
          the work done and are not refunded, except where the law requires otherwise.
        </p>
        <p>If we cannot complete your project, we will refund any amount paid for work we have not delivered.</p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    body: (
      <p>
        Your site may rely on services such as WhatsApp, Google, Shopify, your domain registrar and your hosting provider. Each has its own terms. We are not
        responsible for their outages, price changes or policy decisions, but we will help you deal with them while you are on a care plan.
      </p>
    ),
  },
  {
    id: "no-guarantees",
    title: "What we do not promise",
    body: (
      <p>
        We set up your site and Google listing carefully and report what happened each month, but we do not guarantee search rankings, enquiries, leads or sales.
        Results depend on many things outside our control. We do not build custom apps or software, and we do not run paid advertising.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    body: (
      <p>
        We take reasonable care in our work. To the extent the law allows, our total liability for any claim is limited to the amount you paid us for the build
        or, for care plans, in the 3 months before the claim, and we are not liable for indirect losses such as lost profit or business interruption. Nothing in
        these terms limits liability that cannot be limited under UAE law.
      </p>
    ),
  },
  {
    id: "law",
    title: "Changes, law and disputes",
    body: (
      <>
        <p>
          We may update these terms from time to time. The version on this page when you accept a quote applies to that project, and we will tell you on WhatsApp
          before any change affects an existing care plan.
        </p>
        <p>
          These terms are governed by the laws of the United Arab Emirates. If something goes wrong, please tell us first so we can try to put it right. Any dispute
          we cannot resolve together will be handled by the competent courts of the United Arab Emirates.
        </p>
      </>
    ),
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms of service"
      updated={UPDATED}
      intro={
        <p>
          These terms explain how we quote, build and look after your website: what you pay and when, what we need from you, who owns what, and how to end a
          care plan. They are written to be read, not skimmed past.
        </p>
      }
      sections={sections}
    />
  );
}
