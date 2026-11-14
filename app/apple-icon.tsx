import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand-mark";

// Home-screen icon for iPhone and iPad: the VP mark (components/brand-mark.tsx) as a 180px PNG.
// Square corners: iOS rounds them itself.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<BrandMark size={180} radius={0} />, size);
}
