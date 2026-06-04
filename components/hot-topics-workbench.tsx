"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { HotspotAccessPanel } from "@/components/hotspot-access-panel";
import { contentTypeOptions, defaultPlatform, platformLabels } from "@/lib/platforms/registry";

export function HotTopicsWorkbench() {
  const [items, setItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [profileId, setProfileId] = useState("");
  const [platform, setPlatform] = useState(defaultPlatform);
  const [contentType, setContentType] = useState("图文");
  const [keyword, setKeyword] = useState("");
  const [requirement, setRequirement] = useState("找适合今天创作的热点");
  const [timeRange, setTimeRange] = useState("7d");
  const [count, setCount] = useState(10);
  const [collectorHealth, setCollectorHealth] = useState<{ ok: boolean; baseUrl?: string; mode?: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const [topicsData, profilesData, healthData] = await Promise.all([
      fetch("/api/hot-topics").then((r) => r.json()),
      fetch("/api/ip-profiles").then((r) => r.json()),
      fetch("/api/hot-topics/collector-health").then((r) => r.json()).catch(() => null)
    ]);
    const sourcesData = await fetch("/api/sources").then((r) => r.json());
    setItems(topicsData);
    setProfiles(profilesData);
    setCollectorHealth(healthData);
    setSources(sourcesData.filter((source: any) => source.type === "hot_feed"));
    setProfileId((current) => current || profilesData[0]?.id || "");
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  const sorted = useMemo(() => [...items].sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0)), [items]);

  async function refreshHotspots() {
    try {
      if (!sources.length) throw new Error("请先启用免费或付费热点接口");
      for (const source of sources) {
        await fetch(`/api/sources/${source.id}/fetch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: 20, timeRange: "day" }) });
      }
      setMessage("热点已更新");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

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
      setMessage(`${data.querySummary || "热点搜索完成"} 新增 ${data.createdCount || 0} 条，返回 ${data.totalCount || 0} 条`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "热点搜索失败");
    } finally {
      setSearching(false);
    }
  }

  async function runAction(item: any, action: "analyze" | "generate-topics" | "generate-content" | "used" | "ignored") {
    try {
      if ((action === "analyze" || action === "generate-topics" || action === "generate-content") && !profileId) throw new Error("请先创建并选择一个人设");
      const res =
        action === "used" || action === "ignored"
          ? await fetch(`/api/hot-topics/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: action }) })
          : await fetch(`/api/hot-topics/${item.id}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ipProfileId: profileId, platform, contentType }) });
      if (!res.ok) throw new Error((await res.json()).error || "操作失败");
      setMessage(action === "analyze" ? "AI 分析已完成" : action === "generate-topics" ? "选题已生成" : action === "generate-content" ? "内容初稿和发布计划已生成" : "状态已更新");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">热点雷达</h1>
        <p className="mt-1 text-sm text-muted-foreground">输入关键词和创作要求，从 AI HOT 提取适合当前人设的热点摘要。</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <Card className="rounded-[2.25rem] border-stone-300/80 bg-amber-50/75 shadow-[0_24px_70px_rgba(120,96,62,0.14)]">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_180px_180px]">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">热点关键词</span>
              <Input value={keyword} placeholder="例如：AI自媒体、母婴、职场效率" onChange={(e) => setKeyword(e.target.value)} />
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
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">创作要求</span>
              <Textarea className="min-h-20" value={requirement} onChange={(e) => setRequirement(e.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">时间范围</span>
              <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="24h">近 24 小时</option>
                <option value="3d">近 3 天</option>
                <option value="7d">近 7 天</option>
              </Select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">返回数量</span>
              <Select value={String(count)} onChange={(e) => setCount(Number(e.target.value))}>
                <option value="5">5 条</option>
                <option value="10">10 条</option>
                <option value="20">20 条</option>
                <option value="50">50 条</option>
              </Select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="min-w-64 flex-1 space-y-1 text-sm">
              <span className="text-muted-foreground">匹配人设</span>
              <Select value={profileId} onChange={(e) => setProfileId(e.target.value)}>
                <option value="">请选择</option>
                {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
              </Select>
            </label>
            <Button onClick={searchHotspots} disabled={searching}>
              <Search className="h-4 w-4" />
              {searching ? "提取中" : "提取热点"}
            </Button>
            <span className="pb-2 text-sm text-muted-foreground">{message}</span>
          </div>
        </Card>

        <details className="rounded-[1.75rem] border border-stone-200 bg-card/75 p-3 shadow-[0_12px_28px_rgba(120,96,62,0.08)]">
          <summary className="cursor-pointer text-sm font-semibold">热点来源</summary>
          <div className="mt-3 space-y-3">
            <div className={collectorHealth?.ok ? "rounded-[1.25rem] border border-olive-700/15 bg-olive-50 p-3 text-xs text-olive-900" : "rounded-[1.25rem] border border-amber-700/15 bg-amber-50 p-3 text-xs text-stone-700"}>
              <p className="font-semibold">{collectorHealth?.ok ? "AI HOT 已连接" : "AI HOT 未连接，本地兜底"}</p>
              <p className="mt-1 opacity-75">{collectorHealth?.ok ? "可直接提取最新热点" : "仍可搜索已入库热点"}</p>
            </div>
            <HotspotAccessPanel compact />
            <Button variant="outline" className="h-9 w-full text-xs" onClick={refreshHotspots}>
              <RefreshCw className="h-3.5 w-3.5" />
              更新已有来源
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">主流程优先使用 AI HOT 搜集服务；不可用时保留本地热点库兜底。</p>
          </div>
        </details>
      </div>
      <div className="grid gap-3">
        {sorted.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <CardTitle>{item.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{item.summary || item.url || "暂无摘要"}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>来源：{item.sourceName}</span>
                  <span>类型：{item.sourceType}</span>
                  <span>推荐：{Number(item.recommendationScore || 0).toFixed(1)}</span>
                  <span>热度：{Number(item.heatScore || 0).toFixed(1)}</span>
                  <span>匹配：{Number(item.matchScore || 0).toFixed(1)}</span>
                  <span>商业：{Number(item.businessScore || 0).toFixed(1)}</span>
                  <span>竞争：{Number(item.competitionScore || 0).toFixed(1)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => runAction(item, "analyze")}>AI 分析</Button>
                <Button variant="outline" onClick={() => runAction(item, "generate-content")}>生成初稿</Button>
                <Button variant="ghost" onClick={() => runAction(item, "used")}>已使用</Button>
                <Button variant="ghost" onClick={() => runAction(item, "ignored")}>忽略</Button>
              </div>
            </div>
            {Array.isArray(item.recommendedAngles) && item.recommendedAngles.length > 0 ? (
              <pre className="mt-3 max-h-36 overflow-auto rounded-[1.25rem] bg-muted p-3 text-xs">{JSON.stringify(item.recommendedAngles, null, 2)}</pre>
            ) : null}
          </Card>
        ))}
        {!sorted.length && <Card className="text-sm text-muted-foreground">暂无热点，先启用免费/付费接口，然后点击更新热点。</Card>}
      </div>
    </div>
  );
}
