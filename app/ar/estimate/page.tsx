import type { Metadata } from "next";
import { EstimatePage, estimateMetadata } from "@/components/estimate-page";

export const metadata: Metadata = estimateMetadata("ar");

export default function ArabicEstimate() {
  return <EstimatePage locale="ar" />;
}
