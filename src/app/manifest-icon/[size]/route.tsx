import { ImageResponse } from "next/og";
import { logoDataUri } from "@/lib/logoSvg";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const dimension = size === "512" ? 512 : 192;
  const logoSize = Math.round(dimension * 0.62);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1220",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDataUri()} width={logoSize} height={logoSize} alt="" />
      </div>
    ),
    { width: dimension, height: dimension }
  );
}
