"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Select, Textarea } from "@/components/ui/input";
import { contentTypeOptions, defaultPlatform, platformLabels } from "@/lib/platforms/registry";

const angles = ["解决痛点", "热点观点", "教程清单", "避坑经验", "案例拆解"];

export function TopicsWorkbench() {
  const [items, setItems] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const [platform, setPlatform] = useState(defaultPlatform);
  const [contentType, setContentType] = useState("图文");
  const [angle, setAngle] = useState("解决痛点");
  const [message, setMessage] = useState("");

  async function load() {
    setItems(await fetch("/api/topics").then((r) => r.json()));
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  async function createTopic() {
    const trimmed = note.trim();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${angle}：${trimmed.slice(0, 32)}`,
          corePoint: trimmed,
          targetAudience: "当前 IP 的目标用户",
          userPainPoint: angle,
          platform,
          contentType,
          reason: `通过对话选择「${angle}」生成`,
          outline: ["开场引入", "核心观点", "可执行步骤", "结尾互动"]
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || "保存失败");
      setNote("");
      setMessage("选题已生成");
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
        body: JSON.stringify({ platform: item.platform || defaultPlatform, contentType: item.contentType || "图文" })
      });
      if (!res.ok) throw new Error((await res.json()).error || "生成失败");
      setMessage("内容草稿和发布计划已生成");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">选题助手</h1>
        <p className="mt-1 text-sm text-muted-foreground">不用手动填表，选择方向后用一句话生成选题。</p>
      </div>
      <Card>
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5" />
          <CardTitle>对话生成选题</CardTitle>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Select value={platform} onChange={(event) => setPlatform(event.target.value)}>
            {platformLabels.map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Select value={contentType} onChange={(event) => setContentType(event.target.value)}>
            {contentTypeOptions.map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Select value={angle} onChange={(event) => setAngle(event.target.value)}>
            {angles.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["我想讲一个让新手马上能用的方法", "我想围绕最近热点表达观点", "我想做一个清单型内容", "我想把一个失败经验讲清楚"].map((option) => (
            <button key={option} className="border-2 border-black bg-[#fff200] px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" onClick={() => setNote(option)}>
              {option}
            </button>
          ))}
        </div>
        <Textarea className="mt-4" value={note} onChange={(event) => setNote(event.target.value)} placeholder="用一句话说你想做的内容，剩下交给系统整理成选题。" />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={createTopic}>
            <Sparkles className="h-4 w-4" />
            生成选题
          </Button>
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </Card>
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <CardTitle>{item.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{item.corePoint || item.reason || "暂无核心观点"}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{item.platform}</span><span>{item.contentType}</span><span>{item.status}</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => generateContent(item)}>生成内容初稿</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
