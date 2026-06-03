"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";

function parseJsonArray(value: string) {
  if (!value.trim()) return [];
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [];
}

export function HotTopicsWorkbench() {
  const [items, setItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profileId, setProfileId] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function load() {
    const [topicsData, profilesData] = await Promise.all([
      fetch("/api/hot-topics").then((r) => r.json()),
      fetch("/api/ip-profiles").then((r) => r.json())
    ]);
    setItems(topicsData);
    setProfiles(profilesData);
    setProfileId((current) => current || profilesData[0]?.id || "");
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  const sorted = useMemo(() => [...items].sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0)), [items]);

  async function createManualTopic() {
    try {
      const res = await fetch("/api/hot-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          url: form.url,
          platform: form.platform || "manual",
          sourceName: "Manual",
          sourceType: "manual",
          tags: parseJsonArray(form.tags || "")
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || "保存失败");
      setForm({});
      setMessage("热点已添加");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function runAction(item: any, action: "analyze" | "generate-topics" | "used" | "ignored") {
    try {
      if ((action === "analyze" || action === "generate-topics") && !profileId) throw new Error("请先创建并选择一个 IP Profile");
      const res =
        action === "used" || action === "ignored"
          ? await fetch(`/api/hot-topics/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: action }) })
          : await fetch(`/api/hot-topics/${item.id}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ipProfileId: profileId }) });
      if (!res.ok) throw new Error((await res.json()).error || "操作失败");
      setMessage(action === "analyze" ? "AI 分析已完成" : action === "generate-topics" ? "选题已生成" : "状态已更新");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">热点雷达</h1>
        <p className="mt-1 text-sm text-muted-foreground">查看热点、按推荐指数排序，执行 AI 分析并生成选题。</p>
      </div>
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-72 flex-1 space-y-1 text-sm">
            <span className="text-muted-foreground">分析使用的 IP Profile</span>
            <Select value={profileId} onChange={(e) => setProfileId(e.target.value)}>
              <option value="">请选择</option>
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </Select>
          </label>
          <span className="pb-2 text-sm text-muted-foreground">{message}</span>
        </div>
      </Card>
      <Card>
        <CardTitle>手动添加热点</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input placeholder="标题" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="平台" value={form.platform || ""} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
          <Input placeholder="URL" value={form.url || ""} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <Input placeholder='标签 JSON，例如 ["AI","增长"]' value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <Textarea className="md:col-span-2" placeholder="摘要" value={form.summary || ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </div>
        <Button className="mt-4" onClick={createManualTopic}>保存热点</Button>
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
                <Button variant="outline" onClick={() => runAction(item, "generate-topics")}>生成选题</Button>
                <Button variant="ghost" onClick={() => runAction(item, "used")}>已使用</Button>
                <Button variant="ghost" onClick={() => runAction(item, "ignored")}>忽略</Button>
              </div>
            </div>
            {Array.isArray(item.recommendedAngles) && item.recommendedAngles.length > 0 ? (
              <pre className="mt-3 max-h-36 overflow-auto rounded-none bg-muted p-3 text-xs">{JSON.stringify(item.recommendedAngles, null, 2)}</pre>
            ) : null}
          </Card>
        ))}
        {!sorted.length && <Card className="text-sm text-muted-foreground">暂无热点，先添加来源并采集，或手动添加热点。</Card>}
      </div>
    </div>
  );
}
