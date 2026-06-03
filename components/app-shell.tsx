import Link from "next/link";
import { BarChart3, CalendarDays, FileText, Flame, Gauge, PenLine, Radar, Settings, Sparkles, UserRound } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "仪表盘", icon: Gauge },
  { href: "/ip-profile", label: "IP 定位", icon: UserRound },
  { href: "/sources", label: "来源", icon: Radar },
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
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-white px-3 py-4 lg:block">
        <Link href="/dashboard" className="mb-5 flex items-center gap-2 px-2 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">M</span>
          One MCN Agent
        </Link>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-60">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
