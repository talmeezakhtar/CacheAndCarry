import { Check } from "lucide-react";
import { addOns, packages, paymentTerms } from "@/lib/site";
import { QUOTE_THRESHOLD, aed } from "@/lib/quote";

/*
 * The four packages side by side, next to the builder, so nobody has to scroll back up to the tickets.
 * Every cell comes from lib/site.ts: a feature is "Included" only when the package lists it,
 * otherwise it shows the add-on price, the same rule the builder uses.
 */

const price = (label: string) => addOns.find((a) => a.label === label)?.price ?? null;
const feature = (label: string) => (p: (typeof packages)[number]) =>
  (p.items as readonly string[]).includes(label) ? true : `Add-on, ${aed(price(label))}`;

const rows: { label: string; cell: (p: (typeof packages)[number]) => string | true }[] = [
  { label: "Price", cell: (p) => `${p.from ? "From " : ""}${aed(p.price)}` },
  { label: "Size", cell: (p) => p.note },
  { label: "Basic SEO setup", cell: feature("Basic SEO setup") },
  { label: "Google Business Profile setup", cell: feature("Google Business Profile setup") },
  { label: "How you pay", cell: (p) => (p.price > QUOTE_THRESHOLD ? `Written quote, then ${paymentTerms(p.label).toLowerCase()}` : paymentTerms(p.label)) },
];

export function PackageCompare() {
  return (
    <details className="group mt-6 rounded-2xl border border-line bg-surface">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 font-bold [&::-webkit-details-marker]:hidden sm:px-6">
        Compare the four packages
        <span aria-hidden className="text-2xl font-normal text-accent transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      {/* scrolls sideways on phones, with the row names pinned */}
      <div className="overflow-x-auto border-t border-line">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 bg-surface px-5 py-3 font-normal text-ink/80 sm:px-6">
                <span className="sr-only">Feature</span>
              </th>
              {packages.map((p) => (
                <th key={p.label} scope="col" className="px-4 py-3 font-heading text-lg">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-line">
                <th scope="row" className="sticky left-0 bg-surface px-5 py-3 font-bold sm:px-6">
                  {r.label}
                </th>
                {packages.map((p) => {
                  const v = r.cell(p);
                  return (
                    <td key={p.label} className="px-4 py-3 align-top tabular-nums">
                      {v === true ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-accent">
                          <Check aria-hidden className="size-4" strokeWidth={2.5} />
                          Included
                        </span>
                      ) : (
                        <span className={v.startsWith("Add-on") ? "text-ink/80" : ""}>{v}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
