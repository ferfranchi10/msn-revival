import { ImageResponse } from "next/og";
import { logoDataUri } from "@/lib/logoSvg";

export const alt = "MSN Revival — Un mensaje hacia la nostalgia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logo = logoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070d",
          fontFamily: "Verdana, Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 880,
            display: "flex",
            flexDirection: "column",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid #8fa3c7",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "22px 32px",
              background: "linear-gradient(180deg, #5B8CC5 0%, #3E73B8 55%, #2E5F9E 100%)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={40} height={40} alt="" />
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#ffffff" }}>
              MSN Revival
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 26,
              padding: "64px 48px",
              background: "linear-gradient(180deg, #ffffff 0%, #DDE5F3 100%)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={130} height={130} alt="" />
            <div
              style={{
                display: "flex",
                fontSize: 46,
                fontWeight: 700,
                color: "#1F2D3D",
                textAlign: "center",
              }}
            >
              Un mensaje hacia la nostalgia
            </div>
            <div style={{ display: "flex", fontSize: 24, color: "#33445A" }}>
              Mensajería instantánea retro para tu grupo de amigos
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
