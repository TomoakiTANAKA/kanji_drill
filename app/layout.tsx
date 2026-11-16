import type { Metadata, Viewport } from "next";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "おうちがくしゅう", template: "%s | おうちがくしゅう" },
  // 家族だけで使うサイトなので検索エンジンには載せない
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- 旧版と同じ Google Fonts を使う */}
        <link
          href="https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
