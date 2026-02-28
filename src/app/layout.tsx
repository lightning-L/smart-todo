import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AutoArchiveOnLoad } from "@/components/AutoArchiveOnLoad";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html lang="zh-CN" className={plusJakarta.variable}>
      <body className="min-h-screen antialiased font-sans [font-family:var(--font-sans),system-ui,sans-serif]">
        <AutoArchiveOnLoad />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
