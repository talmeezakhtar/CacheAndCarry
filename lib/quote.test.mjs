// Run: node lib/quote.test.mjs (Node 22.6+ strips the TypeScript types).
import assert from "node:assert/strict";
import { aed, total, message, needsQuote } from "./quote.ts";

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
assert.match(m, /Estimate: AED 378, before VAT/);
// over the threshold the figure is still sent, with the written-quote request
const big = message({ label: "Business", price: 799 }, [{ label: "Online booking", price: 249 }], "", "");
assert.match(big, /Estimate: AED 1,048, before VAT/);
assert.match(big, /written quote/);
// more than 8 pages is quoted too, even under AED 1,000
assert.equal(needsQuote(500, 9), true);
assert.equal(needsQuote(500, 8), false);
assert.match(message({ label: "Business", price: 799 }, [], "", "", undefined, 9), /more than 8 pages, so please send a written quote/);
// care plan line: picked, self-hosted, or left out
assert.match(message({ label: "Starter", price: 299 }, [], "", "", { label: "Go Live", price: 69 }), /Care plan: Go Live, AED 69 a month/);
assert.match(message({ label: "Starter", price: 299 }, [], "", "", null), /host it myself/);
assert.doesNotMatch(m, /Care plan/);
assert.match(message(null, [], "", ""), /bigger site or an online store/);

console.log("quote ok");
