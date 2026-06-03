import type { Metadata } from "next";
import "./globals.css";
import { RootFrame } from "@/components/root-frame";

export const metadata: Metadata = {
  title: "小八的后援团",
  description: "你的专属MCN，已就位"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <RootFrame>{children}</RootFrame>
      </body>
    </html>
  );
}
