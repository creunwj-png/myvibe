import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Agentation } from "agentation";
import { ErrorToaster } from "./lib/error-toaster";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  // CJK 폰트는 용량이 커서 자동 preload를 끈다 (시스템 한글 폰트가 폴백)
  preload: false,
});

const SITE_DESCRIPTION =
  "키워드만 던지면 AI가 프로젝트로 정리해드려요.";

export const metadata: Metadata = {
  metadataBase: new URL("https://myvibe-eight.vercel.app"),
  title: "톡캐치 — 떠오르면 툭, 정리는 알아서.",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "톡캐치 — 떠오르면 툭, 정리는 알아서.",
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: "톡캐치",
  },
  twitter: {
    card: "summary_large_image",
    title: "톡캐치 — 떠오르면 툭, 정리는 알아서.",
    description: SITE_DESCRIPTION,
  },
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
        <ErrorToaster />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
