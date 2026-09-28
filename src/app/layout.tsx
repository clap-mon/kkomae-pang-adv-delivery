import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#6E4720",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3001");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "꼬매팡 어드벤처 (KkomaePang) - 콩쥐의 바느질 모험",
  description: "3D 실과 바늘로 펼쳐지는 감동적인 전래동화 바느질 모험, 꼬매팡 어드벤처!",
  manifest: "/manifest.json",
  openGraph: {
    title: "꼬매팡 어드벤처 (KkomaePang) - 콩쥐의 바느질 모험",
    description: "3D 실과 바늘로 펼쳐지는 감동적인 전래동화 바느질 모험, 꼬매팡 어드벤처!",
    images: [
      {
        url: "/images/kkomaepang_adventure_thumbnail_v3.webp",
        width: 1200,
        height: 630,
        alt: "꼬매팡 어드벤처 3D 바느질 모험 히어로 배너",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
