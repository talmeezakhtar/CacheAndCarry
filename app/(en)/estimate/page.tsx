import type { Metadata } from "next";
import { EstimatePage, estimateMetadata } from "@/components/estimate-page";

export const metadata: Metadata = estimateMetadata("en");

export default function Estimate() {
  return <EstimatePage locale="en" />;
}
