import type { Metadata } from "next";
import "./globals.css";
import { RootFrame } from "@/components/root-frame";

export const metadata: Metadata = {
  title: "One MCN Agent",
  description: "个人 IP 打造运营 Agent 助手"
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
