import { ImageResponse } from "next/og";

// 공유 미리보기(OG) 이미지 — 1200x630 브랜드 카드.
// 빌드 시 정적 생성 → CDN에서 즉시 응답(카카오 등 크롤러 타임아웃 대응).
export const alt = "톡캐치 — 떠오르면 툭, 정리는 알아서.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 이미지에 쓰이는 모든 글자 (Noto Sans KR 서브셋용)
const GLYPHS =
  "톡캐치 떠오르면 툭, 정리는 알아서. 키워드만 던지면 AI가 프로젝트로 정리해드려요. 아이디어 던지기 myvibe-eight.vercel.app";

async function loadFont(weight: number): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(
    GLYPHS
  )}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error("font load failed");
  return (await fetch(src[1])).arrayBuffer();
}

export default async function OpengraphImage() {
  const [bold, regular] = await Promise.all([loadFont(700), loadFont(400)]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 80,
          backgroundColor: "#ffffff",
          fontFamily: "Noto Sans KR",
        }}
      >
        {/* 워드마크 */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              backgroundColor: "#fee500",
            }}
          >
            <div
              style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#1e1e1e" }}
            />
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, color: "#1e1e1e" }}>톡캐치</div>
        </div>

        {/* 가치 한 줄 */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 700, color: "#1e1e1e", lineHeight: 1.15 }}>
            떠오르면 툭,
          </div>
          <div style={{ fontSize: 92, fontWeight: 700, color: "#1e1e1e", lineHeight: 1.15 }}>
            정리는 알아서.
          </div>
          <div style={{ fontSize: 34, fontWeight: 400, color: "#666666", marginTop: 30 }}>
            키워드만 던지면 AI가 프로젝트로 정리해드려요.
          </div>
        </div>

        {/* 하단: 던지기 칩 + 도메인 */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 26px",
              borderRadius: 9999,
              backgroundColor: "#fee500",
              fontSize: 28,
              fontWeight: 700,
              color: "#1e1e1e",
            }}
          >
            아이디어 던지기
          </div>
          <div style={{ fontSize: 28, fontWeight: 400, color: "#999999" }}>
            myvibe-eight.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans KR", data: bold, weight: 700, style: "normal" },
        { name: "Noto Sans KR", data: regular, weight: 400, style: "normal" },
      ],
    }
  );
}
