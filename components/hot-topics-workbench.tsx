"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, Flame, LineChart, ListPlus, Search, Sparkles, Target, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { contentTypeOptions, defaultPlatform, platformLabels } from "@/lib/platforms/registry";

const allPlatforms = "全部";

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown) {
  const next = Number(value || 0);
  return Number.isFinite(next) ? next : 0;
}

function riskLevel(item: any) {
  return String(item?.rawMetrics?.riskLevel || item?.rawData?.riskLevel || "low");
}

function riskLabel(level: string) {
  if (level === "high") return "高";
  if (level === "medium") return "中";
  return "低";
}

function trendBars(seed: string) {
  const base = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: 12 }, (_, index) => 28 + ((base + index * 17) % 56));
}

function contentAngles(item: any, contentType: string) {
  const angles = asArray(item?.recommendedAngles).filter((angle) => typeof angle === "object" || typeof angle === "string");
  if (angles.length) return angles.slice(0, 4);
  return [
    { title: `把热点拆成${contentType}选题`, hook: "先解释发生了什么，再给用户一个可执行结论。" },
    { title: "做一篇观点型内容", hook: "用人设立场判断这个热点为什么值得关注。" },
    { title: "做一篇避坑型内容", hook: "提醒用户不要被热度带偏，给出判断标准。" }
  ];
}

function angleTitle(angle: any) {
  return typeof angle === "string" ? angle : angle?.title || angle?.hook || "创作角度";
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  );
}

export function HotTopicsWorkbench() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileId, setProfileId] = useState("");
  const [platform, setPlatform] = useState(defaultPlatform);
  const [activePlatform, setActivePlatform] = useState(allPlatforms);
  const [contentType, setContentType] = useState("图文");
  const [keyword, setKeyword] = useState("");
  const [requirement, setRequirement] = useState("找适合今天创作的热点");
  const [timeRange, setTimeRange] = useState("7d");
  const [count, setCount] = useState(10);
  const [selectedId, setSelectedId] = useState("");
  const [searching, setSearching] = useState(false);
  const [actionState, setActionState] = useState<{ id: string; label: string } | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const [topicsData, profilesData] = await Promise.all([
      fetch("/api/hot-topics").then((r) => r.json()),
      fetch("/api/ip-profiles").then((r) => r.json())
    ]);
    setItems(topicsData);
    setProfiles(profilesData);
    setSelectedId((current) => current || topicsData[0]?.id || "");
    setProfileId((current) => current || profilesData[0]?.id || "");
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  const sorted = useMemo(() => [...items].sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0)), [items]);
  const visibleItems = useMemo(
    () =>
      activePlatform === allPlatforms
        ? sorted
        : sorted.filter((item) => item.platform === activePlatform || asArray(item.suitablePlatforms).includes(activePlatform)),
    [activePlatform, sorted]
  );
  const selected = visibleItems.find((item) => item.id === selectedId) || visibleItems[0] || sorted[0];
  const personaMatches = useMemo(() => [...sorted].sort((a, b) => numberValue(b.matchScore) - numberValue(a.matchScore)).slice(0, 4), [sorted]);
  const metrics = useMemo(() => {
    const total = visibleItems.length;
    const heat = total ? Math.round(visibleItems.reduce((sum, item) => sum + numberValue(item.heatScore), 0) / total) : 0;
    const match = total ? Math.round(visibleItems.reduce((sum, item) => sum + numberValue(item.matchScore), 0) / total) : 0;
    const lowRisk = visibleItems.filter((item) => riskLevel(item) === "low").length;
    return { total, heat, match, lowRisk };
  }, [visibleItems]);
  const selectedAction = actionState && selected && actionState.id === selected.id ? actionState : null;

  async function searchHotspots() {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setMessage("请输入关键词");
      return;
    }
    setSearching(true);
    setMessage("");
    try {
      const profile = profiles.find((item) => item.id === profileId);
      const res = await fetch("/api/hot-topics/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: trimmed,
          keywords: trimmed.split(/[,\n，、\s]/).map((item) => item.trim()).filter(Boolean),
          platforms: [platform],
          contentTypes: [contentType],
          ipProfileId: profileId || undefined,
          requirements: {
            goal: requirement,
            audienceLevel: profile?.targetAudience ? "按当前人设" : "小白",
            timeRange,
            region: "zh-CN",
            hotness: "rising",
            riskTolerance: "low",
            count
          }
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || "热点搜索失败");
      const data = await res.json();
      setMessage(`已提取 ${data.totalCount || 0} 条，新增 ${data.createdCount || 0} 条`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "热点搜索失败");
    } finally {
      setSearching(false);
    }
  }

  async function runAction(item: any, action: "analyze" | "generate-topics" | "generate-content" | "plan-content" | "used" | "ignored") {
    const actionLabel =
      action === "analyze"
        ? "AI 正在分析热点"
        : action === "generate-topics"
          ? "AI 正在保存为选题"
          : action === "generate-content"
            ? "AI 正在生成内容初稿"
            : action === "plan-content"
              ? "AI 正在加入创作计划"
              : "正在更新状态";
    try {
      if ((action === "analyze" || action === "generate-topics" || action === "generate-content" || action === "plan-content") && !profileId) throw new Error("请先创建并选择一个人设");
      setActionState({ id: item.id, label: actionLabel });
      setMessage(actionLabel);
      const res =
        action === "used" || action === "ignored"
          ? await fetch(`/api/hot-topics/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: action }) })
          : await fetch(`/api/hot-topics/${item.id}/${action === "plan-content" ? "generate-content" : action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ipProfileId: profileId, platform, contentType }) });
      if (!res.ok) throw new Error((await res.json()).error || "操作失败");
      setMessage(
        action === "analyze"
          ? "AI 分析已完成"
          : action === "generate-topics"
            ? "选题已保存"
            : action === "generate-content"
              ? "内容初稿已生成"
              : action === "plan-content"
                ? "已加入创作计划"
                : "状态已更新"
      );
      await load();
      if (action === "generate-topics") router.push("/topics");
      if (action === "generate-content") router.push("/contents");
      if (action === "plan-content") router.push("/calendar");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setActionState(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">热点雷达</h1>
          <p className="mt-1 text-sm text-muted-foreground">先提取热点，再判断热度、人设匹配、风险和创作动作。</p>
        </div>
        <div className="rounded-[999px] border border-stone-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-olive-800">
          {message || "等待提取热点"}
        </div>
      </div>

      <Card className="rounded-[2.25rem] border-stone-300/80 bg-amber-50/75 shadow-[0_24px_70px_rgba(120,96,62,0.14)]">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_160px_160px_140px]">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">热点关键词</span>
            <Input value={keyword} placeholder="例如：OpenAI、AI Agent、母婴、职场效率" onChange={(e) => setKeyword(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">平台</span>
            <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {platformLabels.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">内容类型</span>
            <Select value={contentType} onChange={(e) => setContentType(e.target.value)}>
              {contentTypeOptions.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">时间</span>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="24h">近 24 小时</option>
              <option value="3d">近 3 天</option>
              <option value="7d">近 7 天</option>
            </Select>
          </label>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_150px]">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">创作要求</span>
            <Textarea className="min-h-20" value={requirement} onChange={(e) => setRequirement(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">匹配人设</span>
            <Select value={profileId} onChange={(e) => setProfileId(e.target.value)}>
              <option value="">请选择</option>
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name || "未命名人设"}</option>)}
            </Select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">数量</span>
            <Select value={String(count)} onChange={(e) => setCount(Number(e.target.value))}>
              <option value="5">5 条</option>
              <option value="10">10 条</option>
              <option value="20">20 条</option>
              <option value="50">50 条</option>
            </Select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={searchHotspots} disabled={searching}>
            {searching ? <LoadingDots /> : <Search className="h-4 w-4" />}
            {searching ? "提取中" : "提取热点"}
          </Button>
          {[allPlatforms, ...platformLabels].map((item) => (
            <button
              key={item}
              type="button"
              className={activePlatform === item ? "rounded-[999px] border border-olive-700/20 bg-olive-100 px-3 py-2 text-sm font-semibold text-olive-800" : "rounded-[999px] border border-stone-200 bg-white/65 px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-amber-100"}
              onClick={() => setActivePlatform(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: "入库热点", value: metrics.total, icon: Flame },
          { label: "平均热度", value: metrics.heat, icon: LineChart },
          { label: "人设匹配", value: metrics.match, icon: Target },
          { label: "低风险可用", value: metrics.lowRisk, icon: CheckCircle2 }
        ].map((metric) => (
          <Card key={metric.label} className="rounded-[1.75rem] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <metric.icon className="h-4 w-4 text-olive-700" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden p-0">
          <div className="hidden grid-cols-[48px_minmax(0,1fr)_88px_88px_88px_88px] gap-3 border-b border-stone-200 bg-amber-50/70 px-4 py-3 text-xs font-semibold text-muted-foreground lg:grid">
            <span>#</span>
            <span>热点</span>
            <span className="text-right">热度</span>
            <span className="text-right">匹配</span>
            <span className="text-right">风险</span>
            <span className="text-right">趋势</span>
          </div>
          <div className="divide-y divide-stone-200/80">
            {visibleItems.map((item, index) => {
              const active = item.id === selected?.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={active ? "block w-full bg-olive-50/80 text-left" : "block w-full text-left transition hover:bg-amber-50/70"}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="hidden grid-cols-[48px_minmax(0,1fr)_88px_88px_88px_88px] items-center gap-3 px-4 py-4 lg:grid">
                    <span className="text-sm font-semibold text-stone-400">{index + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{item.title}</span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {asArray(item.tags).slice(0, 3).map((tag) => <span key={String(tag)} className="rounded-[999px] bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">{String(tag)}</span>)}
                      </span>
                    </span>
                    <span className="text-right font-semibold text-olive-800">{numberValue(item.heatScore).toFixed(0)}</span>
                    <span className="text-right font-semibold text-olive-800">{numberValue(item.matchScore).toFixed(0)}</span>
                    <span className="text-right text-sm font-semibold">{riskLabel(riskLevel(item))}</span>
                    <span className="flex h-9 items-end justify-end gap-1">
                      {trendBars(item.id).slice(0, 8).map((height, barIndex) => <span key={barIndex} className="w-1.5 rounded-full bg-olive-600/60" style={{ height: `${height}%` }} />)}
                    </span>
                  </div>
                  <div className="p-4 lg:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{index + 1}. {item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.summary || "暂无摘要"}</p>
                      </div>
                      <span className="rounded-[999px] bg-olive-100 px-2 py-1 text-sm font-semibold text-olive-800">{numberValue(item.heatScore).toFixed(0)}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <span className="rounded-[1rem] bg-amber-50 p-2">匹配 {numberValue(item.matchScore).toFixed(0)}</span>
                      <span className="rounded-[1rem] bg-amber-50 p-2">推荐 {numberValue(item.recommendationScore).toFixed(0)}</span>
                      <span className="rounded-[1rem] bg-amber-50 p-2">风险 {riskLabel(riskLevel(item))}</span>
                    </div>
                  </div>
                </button>
              );
            })}
            {!visibleItems.length ? <div className="p-5 text-sm text-muted-foreground">暂无热点，输入关键词后提取。</div> : null}
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="rounded-[2rem] border-stone-300/80 bg-card/85">
            {selected ? (
              <>
                {selectedAction ? (
                  <div className="mb-4 rounded-[1.5rem] border border-olive-700/15 bg-olive-50 p-3 text-sm font-semibold text-olive-900">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      {selectedAction.label}
                      <LoadingDots />
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-2 w-full animate-pulse rounded-full bg-olive-200" />
                      <div className="h-2 w-2/3 animate-pulse rounded-full bg-amber-200" />
                    </div>
                  </div>
                ) : null}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{selected.title}</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.summary || selected.rawData?.whyRelevant || "暂无摘要"}</p>
                  </div>
                  <span className="rounded-[999px] bg-olive-100 px-3 py-1 text-sm font-semibold text-olive-800">{numberValue(selected.heatScore).toFixed(0)}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-[1.25rem] bg-amber-50 p-3"><p className="text-muted-foreground">热度</p><p className="mt-1 font-semibold">{numberValue(selected.heatScore).toFixed(0)}</p></div>
                  <div className="rounded-[1.25rem] bg-amber-50 p-3"><p className="text-muted-foreground">匹配</p><p className="mt-1 font-semibold">{numberValue(selected.matchScore).toFixed(0)}</p></div>
                  <div className="rounded-[1.25rem] bg-amber-50 p-3"><p className="text-muted-foreground">风险</p><p className="mt-1 font-semibold">{riskLabel(riskLevel(selected))}</p></div>
                </div>
                <div className="mt-4 h-24 rounded-[1.5rem] border border-stone-200 bg-amber-50/70 p-3">
                  <div className="flex h-full items-end gap-2">
                    {trendBars(selected.id).map((height, index) => <span key={index} className="flex-1 rounded-full bg-olive-600/50" style={{ height: `${height}%` }} />)}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold">适合原因</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.rawData?.whyRelevant || selected.summary || "与当前关键词和平台方向匹配，可以继续做选题判断。"}</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold">创作角度</p>
                  <div className="mt-2 space-y-2">
                    {contentAngles(selected, contentType).map((angle, index) => (
                      <button key={`${angleTitle(angle)}-${index}`} type="button" className="w-full rounded-[1.25rem] border border-stone-200 bg-amber-50/70 px-3 py-2 text-left text-sm font-semibold transition hover:bg-amber-100">
                        {angleTitle(angle)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold">风险提示</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{asArray(selected.rawMetrics?.riskNotes).join("，") || "注意核对来源事实，不夸大结论，不制造焦虑。"}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="outline" disabled={Boolean(actionState)} onClick={() => runAction(selected, "generate-topics")}><ListPlus className="h-4 w-4" />保存为选题</Button>
                  <Button disabled={Boolean(actionState)} onClick={() => runAction(selected, "generate-content")}><Wand2 className="h-4 w-4" />生成初稿</Button>
                  <Button variant="outline" disabled={Boolean(actionState)} onClick={() => runAction(selected, "plan-content")}><CalendarPlus className="h-4 w-4" />加入创作计划</Button>
                  <Button variant="ghost" disabled={Boolean(actionState)} onClick={() => runAction(selected, "analyze")}><Sparkles className="h-4 w-4" />AI 分析</Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">选择一个热点后查看详情。</p>
            )}
          </Card>
        </aside>
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-olive-700" />
          <CardTitle>适合当前人设</CardTitle>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          {personaMatches.map((item) => (
            <button key={item.id} type="button" className="rounded-[1.5rem] border border-stone-200 bg-amber-50/70 p-4 text-left transition hover:bg-amber-100" onClick={() => setSelectedId(item.id)}>
              <p className="line-clamp-2 text-sm font-semibold">{item.title}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                <div className="h-full rounded-full bg-olive-600" style={{ width: `${Math.min(100, numberValue(item.matchScore))}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">匹配 {numberValue(item.matchScore).toFixed(0)} · 热度 {numberValue(item.heatScore).toFixed(0)}</p>
            </button>
          ))}
          {!personaMatches.length ? <p className="text-sm text-muted-foreground">暂无可匹配热点。</p> : null}
        </div>
      </Card>
    </div>
  );
}
