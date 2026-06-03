import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Layers3, LockKeyhole, PenLine, Radar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/brand-icon";

const features = [
  { title: "热点接口", text: "通过 URL 获取标准热点信息，主项目专注选题、创作和复盘。", icon: Radar },
  { title: "AI 选题", text: "结合 IP 定位、热点评分和历史表现，把趋势转成可执行选题。", icon: Sparkles },
  { title: "内容工作台", text: "生成草稿、Markdown 编辑、多平台适配和发布计划。", icon: PenLine },
  { title: "数据复盘", text: "录入发布表现，自动计算指标、诊断标签和下一轮建议。", icon: BarChart3 }
];

const detailSections = [
  ["清晰定位", "把人设、受众、价值主张、禁用话题和目标平台沉淀成后续工作流的上下文。"],
  ["选题生产", "热点进入后先评分，再由用户审核，避免全自动发布带来的质量和合规风险。"],
  ["多平台内容", "同一个核心观点可以改写成小红书图文、公众号文章、知乎回答和短视频脚本。"],
  ["增长复盘", "把阅读、收藏、互动和涨粉数据变成下一轮选题建议。"]
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fff9bf] text-black">
      <header className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <BrandIcon className="h-9 w-9" />
          小八的后援团
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

      <section className="relative mx-auto grid min-h-[calc(100vh-56px)] max-w-7xl items-center gap-5 px-5 pb-4 pt-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-none border-2 border-black bg-white px-3 py-1.5 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="h-4 w-4 text-[#ff2d55]" />
            你的专属MCN，已就位
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.35rem]">
            小八的后援团。
            <span className="block bg-[#00e5ff] px-2 text-black">你的专属MCN，已就位。</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-black">
            把 IP 定位、热点发现、AI 选题、内容生成、发布计划和数据复盘收拢到一个清晰的运营闭环里。
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button asChild className="h-10 px-5">
              <Link href="/register">
                使用邀请码进入
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 bg-white px-5">
              <Link href="/login">已有账号登录</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-2 text-sm font-semibold text-black sm:grid-cols-2">
            {["用户审核确认", "不做违规爬虫", "支持多平台内容", "可扩展 Agent 工作流"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#ff2d55]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-none border-4 border-black bg-white p-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="rounded-none border-2 border-black bg-black p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BrandIcon className="h-11 w-11 bg-[#fff200] text-black" />
                  <div>
                    <p className="font-semibold">小八助手</p>
                    <p className="text-xs text-white/60">诊断 · 总结 · 引导 · 帮助</p>
                  </div>
                </div>
                <LockKeyhole className="h-5 w-5 text-white/50" />
              </div>
              <div className="mt-4 grid gap-2">
                {[
                  ["IP 上下文", "持续沉淀"],
                  ["热点入口", "URL 接入"],
                  ["内容复盘", "下一轮建议"]
                ].map(([title, text]) => (
                  <div key={title} className="flex items-center justify-between rounded-none border-2 border-white bg-black px-3 py-2.5">
                    <div className="text-sm font-medium">{title}</div>
                    <p className="text-xs text-white/65">{text as string}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 pt-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex h-16 flex-col justify-center rounded-none border-2 border-black bg-[#fff200] px-3">
                  <feature.icon className="h-4 w-4 text-black" />
                  <p className="mt-1 text-sm font-medium">{feature.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-4 border-black bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[360px_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-none border-2 border-black bg-[#00e5ff] px-3 py-1 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Layers3 className="h-4 w-4" />
              产品能力
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight">把复杂的运营系统，收进清晰的工作台。</h2>
            <p className="mt-4 text-sm leading-7 text-[#6c6258]">
              首页首屏给出完整价值和入口；继续下滑时，才展开更详细的产品模块、工作流和适用场景。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {detailSections.map(([title, text]) => (
              <div key={title} className="rounded-none border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-lg font-semibold">{title}</p>
                <p className="mt-3 text-sm leading-7 text-black">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
