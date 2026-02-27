import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AutoArchiveOnLoad } from "@/components/AutoArchiveOnLoad";

export const metadata: Metadata = {
  title: "Todo · Calendar Agenda",
  description: "以日历日程为核心的个人 Todo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AutoArchiveOnLoad />
        {children}
      </body>
    </html>
  );
}
