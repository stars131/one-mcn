"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const publicPaths = ["/", "/login", "/register"];

export function RootFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (publicPaths.includes(pathname)) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
