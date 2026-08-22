import { ImageResponse } from "next/og";

export const alt = "Pioneer Trio Services — Immigration & Marriage Consultancy, Bangladesh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#4f46e5",
            }}
          >
            P3
          </div>
          Pioneer Trio Services
        </div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, marginTop: 40, maxWidth: 900 }}>
          Two of life&apos;s biggest decisions. One trusted partner.
        </div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 24, color: "#c7d2fe", maxWidth: 820 }}>
          Immigration Consultancy & Marriage Consultancy — verified process, real people, no
          hidden broker fees.
        </div>
      </div>
    ),
    { ...size }
  );
}
