// Run: node lib/quote.test.mjs (Node 22.6+ strips the TypeScript types).
import assert from "node:assert/strict";
import { aed, total, message, needsQuote, followPages } from "./quote.ts";

// unconfirmed prices print in brackets; confirmed ones do not
assert.equal(aed(null), "AED [confirm]");
assert.equal(aed(1299, false), "AED [1,299]");
assert.equal(aed(1299, true), "AED 1,299");
assert.equal(aed(1299), "AED 1,299"); // prices are confirmed, so no brackets by default

assert.equal(total([{ label: "a", price: 299 }, { label: "b", price: 79 }]), 378);
assert.equal(total([{ label: "a", price: 299 }, { label: "b", price: null }]), null);

// over AED 1,000 hands over to a written quote (PDF 6.1)
assert.equal(needsQuote(1000), false);
assert.equal(needsQuote(1001), true);
assert.equal(needsQuote(null), false);

const m = message({ label: "Starter", price: 299 }, [{ label: "Photo gallery", price: 79 }], " Rose Salon ", "");
assert.match(m, /Starter package/);
assert.match(m, /Business: Rose Salon/);
assert.doesNotMatch(m, /Area:/);
assert.match(m, /Estimate: AED 378\.$/m);
// over the threshold the figure is still sent, with the written-quote request
const big = message({ label: "Business", price: 799 }, [{ label: "Online booking", price: 249 }], "", "");
assert.match(big, /Estimate: AED 1,048\. /);
assert.match(big, /written quote/);
// more than 8 pages is quoted too, even under AED 1,000
assert.equal(needsQuote(500, 9), true);
assert.equal(needsQuote(500, 8), false);
assert.match(message({ label: "Business", price: 799 }, [], "", "", { pages: 9 }), /more than 8 pages, so please send a written quote/);
// care plan line: picked, self-hosted, or left out
assert.match(message({ label: "Starter", price: 299 }, [], "", "", { care: { label: "Go Live", price: 69 } }), /Care plan: Go Live, AED 69 a month/);
assert.match(message({ label: "Starter", price: 299 }, [], "", "", { care: null }), /host it myself/);
assert.doesNotMatch(m, /Care plan/);
assert.match(message(null, [], "", ""), /bigger site or an online store/);

// no VAT anywhere while the business is not VAT-registered
assert.doesNotMatch(big, /VAT/);

// founding place and the builder link
const f = message({ label: "Starter", price: 199 }, [], "", "", { founding: true, link: "https://x.test/estimate?f=1" });
assert.match(f, /Founding place: yes, AED 199/);
assert.match(f, /Estimate: AED 199\./);
assert.match(f, /My choices: https:\/\/x\.test\/estimate\?f=1$/);
assert.doesNotMatch(m, /Founding|My choices/);

// per-page add-ons follow the page count (Business 4 pages + 2 extra: Arabic 4 -> 6), and never exceed it
const P = ["Arabic version, per page", "We write your text, per page"];
assert.deepEqual(followPages({ "Arabic version, per page": 4 }, P, 4, 6), { "Arabic version, per page": 6 });
assert.deepEqual(followPages({ "Arabic version, per page": 2 }, P, 4, 6), { "Arabic version, per page": 2 }); // a partial choice stays
assert.deepEqual(followPages({ "Arabic version, per page": 3, "Extra page": 2 }, P, 4, 1), { "Arabic version, per page": 1, "Extra page": 2 });
assert.deepEqual(followPages({}, P, 1, 4), {});

console.log("quote ok");
