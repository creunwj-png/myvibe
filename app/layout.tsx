import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Agentation } from "agentation";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  // CJK 폰트는 용량이 커서 자동 preload를 끈다 (시스템 한글 폰트가 폴백)
  preload: false,
});

export const metadata: Metadata = {
  title: "톡캐치",
  description: "떠오르면 툭, 정리는 알아서. 키워드만 던지면 AI가 프로젝트로 정리해드려요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
