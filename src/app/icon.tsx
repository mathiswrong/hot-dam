import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const runtime = "edge";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ef6b2a 0%, #e0511f 100%)",
          borderRadius: "8px",
          fontSize: 18,
          fontWeight: 700,
          color: "white",
        }}
      >
        H
      </div>
    ),
    { ...size }
  );
}
