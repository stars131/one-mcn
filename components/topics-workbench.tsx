"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";

function parseArray(value: string) {
  if (!value.trim()) return [];
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [];
}

export function TopicsWorkbench() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function load() {
    setItems(await fetch("/api/topics").then((r) => r.json()));
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  async function createTopic() {
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          corePoint: form.corePoint || "",
          targetAudience: form.targetAudience || "",
          userPainPoint: form.userPainPoint || "",
          platform: form.platform || "小红书",
          contentType: form.contentType || "图文",
          reason: form.reason || "",
          outline: parseArray(form.outline || "")
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || "保存失败");
      setForm({});
      setMessage("选题已保存");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function generateContent(item: any) {
    try {
      const res = await fetch(`/api/topics/${item.id}/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: item.platform || "小红书", contentType: item.contentType || "图文" })
      });
      if (!res.ok) throw new Error((await res.json()).error || "生成失败");
      setMessage("内容草稿已生成");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function updateStatus(item: any, status: string) {
    const res = await fetch(`/api/topics/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) setMessage((await res.json()).error || "更新失败");
    else {
      setMessage("状态已更新");
      await load();
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">选题库</h1>
        <p className="mt-1 text-sm text-muted-foreground">审核、创建、排序选题，并根据选题生成内容草稿。</p>
      </div>
      <Card>
        <CardTitle>新增选题</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input placeholder="标题" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="核心观点" value={form.corePoint || ""} onChange={(e) => setForm({ ...form, corePoint: e.target.value })} />
          <Input placeholder="目标用户" value={form.targetAudience || ""} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
          <Input placeholder="用户痛点" value={form.userPainPoint || ""} onChange={(e) => setForm({ ...form, userPainPoint: e.target.value })} />
          <Input placeholder="平台" value={form.platform || ""} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
          <Input placeholder="内容类型" value={form.contentType || ""} onChange={(e) => setForm({ ...form, contentType: e.target.value })} />
          <Textarea placeholder="理由" value={form.reason || ""} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Textarea placeholder='大纲 JSON，例如 ["开头","论点","结尾"]' value={form.outline || ""} onChange={(e) => setForm({ ...form, outline: e.target.value })} />
        </div>
        <div className="mt-4 flex items-center gap-3"><Button onClick={createTopic}>保存选题</Button><span className="text-sm text-muted-foreground">{message}</span></div>
      </Card>
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <CardTitle>{item.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{item.corePoint || item.reason || "暂无核心观点"}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{item.platform}</span><span>{item.contentType}</span><span>流量 {item.trafficScore}</span><span>商业 {item.businessScore}</span><span>难度 {item.difficultyScore}</span><span>{item.status}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => generateContent(item)}>生成内容</Button>
                <Select className="w-32" value={item.status} onChange={(e) => updateStatus(item, e.target.value)}>
                  <option value="draft">draft</option>
                  <option value="approved">approved</option>
                  <option value="generating">generating</option>
                  <option value="archived">archived</option>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
