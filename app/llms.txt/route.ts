import { addOns, carePlans, demos, faqs, founding, included, packages, paymentTerms, site, smallEdit } from "@/lib/site";
import { QUOTE_THRESHOLD, PAGE_LIMIT, aed } from "@/lib/quote";

/*
 * /llms.txt (llmstxt.org): a plain summary of the business for AI assistants and answer engines, so they quote
 * the real offer instead of guessing. Built from lib/site.ts on every build, so prices and rules never drift from
 * the pages. Same honesty rules as the site: no clients, ratings or guarantees are claimed.
 */

const url = (path: string) => new URL(path, site.url).toString();
const list = (items: readonly string[]) => items.map((x) => `- ${x}`).join("\n");

export function GET() {
  const body = `# ${site.name}

> Websites and Google listings for small businesses in Sharjah and Dubai (UAE), in English and Arabic. Fixed, published prices; every enquiry happens on WhatsApp; the client owns the domain. A one-page Starter site goes live ${site.delivery} after we have the content and payment.

${site.name} is a small web studio. It builds websites for small businesses such as shops, cafés, salons, boutiques and restaurants, then keeps them running for a monthly fee. There is no contact form: enquiries start with a pre-filled WhatsApp message to ${site.phone}.

## Pages

- [Home (English)](${url("/")}): packages, care plans, what counts as an edit, FAQ
- [Price builder (English)](${url("/estimate")}): pick a package and add-ons, see the total, send it on WhatsApp
- [الصفحة الرئيسية (العربية)](${url("/ar")}): the same site in Arabic
- [حاسبة الأسعار (العربية)](${url("/ar/estimate")}): the price builder in Arabic
- [Privacy policy](${url("/privacy")}) and [Terms of service](${url("/terms")}) (English)

## Build packages (one-off, AED)

${packages
  .map((p) => `- ${p.label}: ${"from" in p && p.from ? "from " : ""}${aed(p.price)}. ${p.note}. Includes: ${p.items.join("; ")}. ${p.price > QUOTE_THRESHOLD ? "Confirmed in a written quote." : `${paymentTerms(p.label)}.`}`)
  .join("\n")}
- Every package includes: ${included.join(", ")}.
${founding.left > 0 ? `- Founding offer: Starter for ${aed(founding.price)} instead of ${aed(founding.was)} for the first ${founding.places} clients, in return for a short testimonial.\n` : ""}- Payment: Starter is paid in full upfront; bigger builds are 50% to start and 50% before go-live.
- Anything over ${aed(QUOTE_THRESHOLD)} or more than ${PAGE_LIMIT} pages is quoted in writing first. Quotes are valid for 7 days.

## Monthly care plans (AED a month)

${carePlans.map((p) => `- ${p.label}: ${aed(p.price)} a month. ${p.description} Includes: ${p.items.join("; ")}.`).join("\n")}
- 3-month minimum, then monthly; cancel with 30 days' notice. Paying yearly gives 2 months free (prepaid, unused months not refunded).

## What counts as a small edit

In a care plan:
${list(smallEdit.inPlan)}

Quoted separately:
${list(smallEdit.paid)}

## Add-ons (AED)

${addOns.map((a) => `- ${a.label}: ${aed(a.price)}${a.only ? ` (${a.only.join(", ")} only)` : ""}`).join("\n")}

## Not offered

- Custom apps or software, paid ad campaigns.
- No guaranteed Google rankings, leads or sales.

## Sites we designed

These are sites the studio designed; they are not presented as paid client work.
${demos.map((d) => `- [${d.name}](${d.url}): ${d.summary}`).join("\n")}

## FAQ

${faqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
