import Link from "next/link";
import { BarChart3, CalendarDays, FileText, Flame, Gauge, PenLine, Radar, Settings, Sparkles, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { BrandIcon } from "@/components/brand-icon";

const nav = [
  { href: "/dashboard", label: "仪表盘", icon: Gauge },
  { href: "/ip-profile", label: "人设", icon: UserRound },
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
    <div className="min-h-screen bg-[#faf6f1]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-stone-200 bg-amber-50/80 px-3 py-4 backdrop-blur lg:block">
        <Link href="/dashboard" className="mb-5 flex items-center gap-3 px-2 text-lg font-semibold">
          <BrandIcon className="h-9 w-9" />
          <span>
            小八的后援团
            <span className="block text-xs font-normal text-muted-foreground">你的专属MCN，已就位</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-[1.25rem] px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-amber-100 hover:text-foreground">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3 space-y-2">
          <div className="rounded-[1.5rem] border border-stone-200 bg-sage-50 p-3 text-xs font-semibold text-stone-700 shadow-[0_12px_28px_rgba(120,96,62,0.10)]">
            <p className="font-medium text-foreground">推广版入口已启用</p>
            <p className="mt-1">首页面向用户，侧边栏保留完整运营后台。</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
