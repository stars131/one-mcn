import Link from "next/link";
import { ArrowRight, BarChart3, CalendarDays, FileText, Flame, PenLine, Radar, Settings, Sparkles, UserRound } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db/prisma";
import { getDefaultUserId } from "@/lib/db/default-user";
import { ensureCurrentOperatingAccount } from "@/lib/accounts/current-account";
import { OperatingAccountSwitcher } from "@/components/operating-account-switcher";
import { BrandIcon } from "@/components/brand-icon";

export const dynamic = "force-dynamic";

const quickActions = [
  { href: "/ip-profile", label: "确定人设", text: "先确定人设、受众、关键词和变现目标。", icon: UserRound, color: "bg-olive-100 text-olive-800" },
  { href: "/sources", label: "接入热点来源", text: "GitHub、RSS、API JSON 和手动热点统一采集。", icon: Radar, color: "bg-sage-100 text-sage-700" },
  { href: "/hot-topics", label: "分析今日热点", text: "按推荐指数筛选，并用 AI 生成创作角度。", icon: Flame, color: "bg-amber-100 text-stone-800" },
  { href: "/topics", label: "生成选题", text: "把热点转成可审核、可生产的选题库。", icon: Sparkles, color: "bg-stone-100 text-stone-700" },
  { href: "/contents", label: "进入创作台", text: "生成内容草稿，做多平台改写和 Markdown 编辑。", icon: PenLine, color: "bg-amber-50 text-olive-800" },
  { href: "/analytics", label: "复盘数据", text: "录入发布表现，自动计算指标和诊断标签。", icon: BarChart3, color: "bg-sage-50 text-stone-800" }
];

const flow = ["人设", "来源采集", "热点分析", "选题策划", "内容生成", "发布计划", "数据录入", "增长复盘"];

async function loadDashboardData() {
  const userId = await getDefaultUserId();
  const currentAccount = await ensureCurrentOperatingAccount(userId);
  const accounts = await prisma.operatingAccount.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  const accountWhere = { userId, operatingAccountId: currentAccount.id };
  const [ipProfiles, sources, hotTopics, topics, contents, publishRecords, metrics, reports] = await Promise.all([
    prisma.ipProfile.count({ where: accountWhere }),
    prisma.source.count({ where: accountWhere }),
    prisma.hotTopic.count({ where: accountWhere }),
    prisma.topic.count({ where: accountWhere }),
    prisma.content.count({ where: accountWhere }),
    prisma.publishRecord.count({ where: accountWhere }),
    prisma.contentMetric.findMany({ where: accountWhere, select: { views: true, followersGained: true } }),
    prisma.reviewReport.findFirst({ where: accountWhere, orderBy: { createdAt: "desc" } })
  ]);
  const totalViews = metrics.reduce((sum, item) => sum + item.views, 0);
  const totalFollowers = metrics.reduce((sum, item) => sum + item.followersGained, 0);
  return { accounts, currentAccount, ipProfiles, sources, hotTopics, topics, contents, publishRecords, totalViews, totalFollowers, latestReport: reports };
}

export default async function DashboardPage() {
  const data = await loadDashboardData();
  const stats = [
    ["人设", data.ipProfiles],
    ["热点来源", data.sources],
    ["热点池", data.hotTopics],
    ["选题库", data.topics],
    ["内容草稿", data.contents],
    ["发布计划", data.publishRecords],
    ["总阅读", data.totalViews],
    ["总涨粉", data.totalFollowers]
  ];

  return (
    <div className="space-y-6">
      <OperatingAccountSwitcher accounts={data.accounts} currentId={data.currentAccount.id} />

      <section className="grid gap-5 lg:grid-cols-[1fr_390px]">
        <div className="rounded-[2.25rem] border border-stone-200 bg-card/90 p-6 shadow-[0_18px_45px_rgba(120,96,62,0.12)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-[999px] border border-stone-200 bg-amber-50 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI Agent 驱动的人设运营台
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-[#241f1a]">
                你的专属MCN，已就位
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                保留专业后台能力，同时把常用动作收敛成助手式入口：定位、采集、分析、选题、创作、发布、数据和复盘。
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                系统设置
              </Link>
            </Button>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="group rounded-[1.75rem] border border-stone-200 bg-amber-50/70 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_36px_rgba(120,96,62,0.12)]">
                <div className={`flex h-10 w-10 items-center justify-center rounded-[1.25rem] ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <h2 className="font-semibold">{action.label}</h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.text}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-stone-200 bg-stone-800 p-5 text-amber-50 shadow-[0_20px_54px_rgba(80,63,42,0.18)]">
          <div className="flex items-center gap-3">
            <BrandIcon className="h-10 w-10 bg-amber-100 text-olive-800" />
            <div>
              <CardTitle className="text-amber-50">小八助手</CardTitle>
              <p className="text-xs text-amber-50/65">诊断 · 总结 · 引导 · 帮助</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-amber-50/80">
            推荐先完成人设，再添加热点来源。采集后进入热点雷达执行 AI 分析，最后把表现数据录入分析页生成复盘。
          </p>
          <div className="mt-5 space-y-3">
            {[
              ["下一步", data.ipProfiles ? "进入热点雷达，分析可转化热点" : "先创建一个人设"],
              ["本周重点", "优先打通 1 条内容从选题到复盘的链路"],
              ["后台能力", "设置、来源、数据、报告仍完整保留"]
            ].map(([label, text]) => (
              <div key={label} className="rounded-[1.5rem] border border-amber-50/20 bg-stone-700/60 p-3">
                <p className="text-xs text-amber-50/55">{label}</p>
                <p className="mt-1 text-sm">{text}</p>
              </div>
            ))}
          </div>
          <Button asChild className="mt-5 w-full bg-amber-50 text-stone-800 hover:bg-amber-100">
            <Link href={data.ipProfiles ? "/hot-topics" : "/ip-profile"}>开始处理</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>运营闭环</CardTitle>
            <span className="text-xs text-muted-foreground">半自动，用户审核确认</span>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-4">
            {flow.map((step, index) => (
              <div key={step} className="rounded-[1.5rem] border border-stone-200 bg-amber-50 p-3">
                <span className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-2 text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>最新复盘建议</CardTitle>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {data.latestReport?.summary || "录入内容数据后，可以在复盘报告页生成周期复盘和下一轮选题建议。"}
          </p>
          <Button asChild className="mt-5 w-full">
            <Link href="/reports">
              <FileText className="h-4 w-4" />
              查看复盘报告
            </Link>
          </Button>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Link href="/calendar" className="rounded-[1.75rem] border border-stone-200 bg-card/90 p-4 text-sm transition hover:bg-amber-50 hover:shadow-[0_16px_36px_rgba(120,96,62,0.12)]">
          <CalendarDays className="h-5 w-5 text-primary" />
          <p className="mt-3 font-medium">安排发布时间</p>
          <p className="mt-1 text-muted-foreground">把待发布内容放进计划表。</p>
        </Link>
        <Link href="/analytics" className="rounded-[1.75rem] border border-stone-200 bg-card/90 p-4 text-sm transition hover:bg-sage-50 hover:shadow-[0_16px_36px_rgba(120,96,62,0.12)]">
          <BarChart3 className="h-5 w-5 text-primary" />
          <p className="mt-3 font-medium">录入发布数据</p>
          <p className="mt-1 text-muted-foreground">计算阅读、互动、收藏和转粉。</p>
        </Link>
        <Link href="/settings" className="rounded-[1.75rem] border border-stone-200 bg-card/90 p-4 text-sm transition hover:bg-amber-50 hover:shadow-[0_16px_36px_rgba(120,96,62,0.12)]">
          <Settings className="h-5 w-5 text-primary" />
          <p className="mt-3 font-medium">配置系统参数</p>
          <p className="mt-1 text-muted-foreground">AI Provider、模型、Token 和默认平台。</p>
        </Link>
      </section>
    </div>
  );
}
