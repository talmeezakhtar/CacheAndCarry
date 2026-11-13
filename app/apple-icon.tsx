import { ImageResponse } from "next/og";

// Home-screen icon for iPhone and iPad: the same C&C monogram as app/icon.svg, as a 180px PNG.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#17211b", color: "#fcfcfa", fontSize: 76, fontWeight: 700, letterSpacing: -3 }}>
        C<span style={{ color: "#b9c79e" }}>&amp;</span>C
      </div>
    ),
    size,
  );
}
