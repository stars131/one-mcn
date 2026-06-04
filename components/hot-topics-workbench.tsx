"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { HotspotAccessPanel } from "@/components/hotspot-access-panel";
import { contentTypeOptions, defaultPlatform, platformLabels } from "@/lib/platforms/registry";

export function HotTopicsWorkbench() {
  const [items, setItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [profileId, setProfileId] = useState("");
  const [platform, setPlatform] = useState(defaultPlatform);
  const [contentType, setContentType] = useState("图文");
  const [message, setMessage] = useState("");

  async function load() {
    const [topicsData, profilesData] = await Promise.all([
      fetch("/api/hot-topics").then((r) => r.json()),
      fetch("/api/ip-profiles").then((r) => r.json())
    ]);
    const sourcesData = await fetch("/api/sources").then((r) => r.json());
    setItems(topicsData);
    setProfiles(profilesData);
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
        <p className="mt-1 text-sm text-muted-foreground">选择免费或付费热点接口，展示热点后按人设一键生成内容初稿。</p>
      </div>
      <HotspotAccessPanel />
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-72 flex-1 space-y-1 text-sm">
            <span className="text-muted-foreground">分析使用的人设</span>
            <Select value={profileId} onChange={(e) => setProfileId(e.target.value)}>
              <option value="">请选择</option>
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </Select>
          </label>
          <label className="min-w-40 space-y-1 text-sm">
            <span className="text-muted-foreground">生成平台</span>
            <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {platformLabels.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </label>
          <label className="min-w-40 space-y-1 text-sm">
            <span className="text-muted-foreground">内容类型</span>
            <Select value={contentType} onChange={(e) => setContentType(e.target.value)}>
              {contentTypeOptions.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </label>
          <span className="pb-2 text-sm text-muted-foreground">{message}</span>
          <Button onClick={refreshHotspots}>更新热点</Button>
        </div>
      </Card>
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
              <pre className="mt-3 max-h-36 overflow-auto rounded-none bg-muted p-3 text-xs">{JSON.stringify(item.recommendedAngles, null, 2)}</pre>
            ) : null}
          </Card>
        ))}
        {!sorted.length && <Card className="text-sm text-muted-foreground">暂无热点，先启用免费/付费接口，然后点击更新热点。</Card>}
      </div>
    </div>
  );
}
