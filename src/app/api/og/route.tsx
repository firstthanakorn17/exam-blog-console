import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (
    searchParams.get("title") ||
    "NextBlog — Editorial & Technical Publishing Platform"
  ).slice(0, 100);
  const category = `/${searchParams.get("category") || "engineering"}`;
  const authorLabel = `By ${searchParams.get("author") || "Admin First"}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          color: "#fafafa",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: 24,
              fontWeight: 600,
              color: "#e4e4e7",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "#fafafa",
                color: "#09090b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
              }}
            >
              N
            </div>
            <span>NextBlog Editorial</span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 18,
              padding: "6px 16px",
              borderRadius: 999,
              backgroundColor: "#27272a",
              color: "#d4d4d8",
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.2,
            color: "#ffffff",
            maxWidth: "980px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #27272a",
            paddingTop: "24px",
            fontSize: 20,
            color: "#a1a1aa",
          }}
        >
          <span>{authorLabel}</span>
          <span>nextblog.example.com</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
