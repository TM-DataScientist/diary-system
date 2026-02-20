import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "営業日報システム",
  description: "営業担当者の日々の活動を記録・管理するシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
