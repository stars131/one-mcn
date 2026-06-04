import Link from "next/link";
import { BarChart3, CalendarDays, FileText, Flame, Gauge, PenLine, Settings, Sparkles, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { BrandIcon } from "@/components/brand-icon";

const nav = [
  { href: "/dashboard", label: "仪表盘", icon: Gauge },
  { href: "/ip-profile", label: "人设", icon: UserRound },
  { href: "/hot-topics", label: "热点", icon: Flame },
  { href: "/topics", label: "选题", icon: Sparkles },
  { href: "/contents", label: "内容", icon: PenLine },
  { href: "/calendar", label: "日历", icon: CalendarDays },
  { href: "/analytics", label: "分析", icon: BarChart3 },
  { href: "/reports", label: "复盘", icon: FileText },
  { href: "/settings", label: "设置", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf6f1]">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-amber-50/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold">
          <BrandIcon className="h-9 w-9" />
          <span>
            小八的后援团
            <span className="hidden text-xs font-normal text-muted-foreground sm:block">你的专属MCN，已就位</span>
          </span>
        </Link>
          <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-[1.25rem] px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-amber-100 hover:text-foreground">
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
          <LogoutButton />
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
