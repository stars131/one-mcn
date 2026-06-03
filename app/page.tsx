import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Flame, LockKeyhole, PenLine, Radar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { title: "热点雷达", text: "接入 GitHub、RSS、API JSON 和手动热点，统一标准化和去重。", icon: Radar },
  { title: "AI 选题", text: "结合 IP 定位、热点评分和历史表现，把趋势转成可执行选题。", icon: Sparkles },
  { title: "内容工作台", text: "生成草稿、Markdown 编辑、多平台适配和发布计划。", icon: PenLine },
  { title: "数据复盘", text: "录入发布表现，自动计算指标、诊断标签和下一轮建议。", icon: BarChart3 }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f4ed] text-[#1d1b18]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4a3828] text-white">助</span>
          One MCN
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">登录</Link>
          </Button>
          <Button asChild>
            <Link href="/register">申请进入</Link>
          </Button>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1fr_440px]">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-[#0f8b8d]/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-[#6c6258] shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#0f8b8d]" />
            给个人创作者的一人 MCN 工作台
          </div>
          <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            简约，不简单。
            <span className="block text-[#0f8b8d]">从热点到复盘，一次完成。</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#625a50]">
            One MCN 把 IP 定位、热点发现、AI 选题、内容生成、发布计划和数据复盘收拢到一个清晰的运营闭环里。
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild className="h-11 rounded-full px-5">
              <Link href="/register">
                使用邀请码进入
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full bg-white/70 px-5">
              <Link href="/login">已有账号登录</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-[#6c6258]">
            {["用户审核确认", "不做违规爬虫", "支持多平台内容", "可扩展 Agent 工作流"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0f8b8d]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-white/80 bg-white/75 p-4 shadow-2xl shadow-[#4a3828]/15 backdrop-blur">
            <div className="rounded-[1.5rem] bg-[#4a3828] p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-semibold">助</span>
                  <div>
                    <p className="font-semibold">起点小助手</p>
                    <p className="text-xs text-white/60">诊断 · 总结 · 引导 · 帮助</p>
                  </div>
                </div>
                <LockKeyhole className="h-5 w-5 text-white/50" />
              </div>
              <div className="mt-6 space-y-3">
                {[
                  ["今日热点", "AI Agent 工作流正在升温", Flame],
                  ["推荐选题", "一个人如何搭建内容增长闭环", Sparkles],
                  ["复盘提醒", "收藏率高，适合继续做工具型内容", BarChart3]
                ].map(([title, text, Icon]) => (
                  <div key={title as string} className="rounded-2xl bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4" />
                      {title as string}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/70">{text as string}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 p-2 pt-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3 rounded-2xl border bg-[#fbfaf7] p-4">
                  <feature.icon className="mt-1 h-5 w-5 text-[#0f8b8d]" />
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#6c6258]">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
