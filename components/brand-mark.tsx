/*
 * The Vibe & Pixel mark: an original "VP" monogram in heavy, rounded strokes (soft ends, tight kerning), on the ink
 * tile. V in linen, P in sage, from the site palette. Plain SVG with no hooks, so the same drawing works in the page,
 * the dashboard and the generated icons (next/og). app/icon.svg holds the same paths for the browser tab icon.
 */
export const MARK = {
  tile: "#17211b",
  v: "#fcfcfa",
  p: "#b9c79e",
  vPath: "M11 19 L20.5 44 L30 19",
  pPath: "M37.5 45 V19 H44 a7.5 7.5 0 0 1 0 15 H37.5",
} as const;

export function BrandMark({ size = 64, radius = 14, title }: { size?: number; radius?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <rect width="64" height="64" rx={radius} fill={MARK.tile} />
      <g fill="none" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(0.5 0.5)">
        <path d={MARK.vPath} stroke={MARK.v} />
        <path d={MARK.pPath} stroke={MARK.p} />
      </g>
    </svg>
  );
}
