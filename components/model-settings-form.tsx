"use client";

import { useState } from "react";
import { KeyRound, Save, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

type ModelSettings = {
  mode: "server_credits" | "custom";
  provider: string;
  baseUrl: string;
  textModel: string;
  multimodalModel: string;
  imageModel: string;
  credits?: number;
  hasCustomKey?: boolean;
};

export function ModelSettingsForm({ initial }: { initial: ModelSettings }) {
  const [form, setForm] = useState(initial);
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings/model-preference", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, apiKey: apiKey || undefined })
      });
      if (!res.ok) throw new Error((await res.json()).error || "保存失败");
      setApiKey("");
      setMessage("模型设置已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold">使用方式</span>
          <Select value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value as ModelSettings["mode"] })}>
            <option value="server_credits">积分制：使用服务器模型</option>
            <option value="custom">自带 Key：使用我的模型</option>
          </Select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Provider</span>
          <Input value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} placeholder="newapi" />
        </label>
        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-semibold">Base URL</span>
          <Input value={form.baseUrl} onChange={(event) => setForm({ ...form, baseUrl: event.target.value })} placeholder="https://elysiver.h-e.top" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">语言模型</span>
          <Input value={form.textModel} onChange={(event) => setForm({ ...form, textModel: event.target.value })} placeholder="deepseek-v4-pro" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">多模态模型</span>
          <Input value={form.multimodalModel} onChange={(event) => setForm({ ...form, multimodalModel: event.target.value })} placeholder="deepseek-v4-pro" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">生图模型</span>
          <Input value={form.imageModel} onChange={(event) => setForm({ ...form, imageModel: event.target.value })} placeholder="deepseek-v4-pro" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">我的 API Key</span>
          <Input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={initial.hasCustomKey ? "已配置，留空不修改" : "仅自带 Key 模式需要"} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={loading}>
          <Save className="h-4 w-4" />
          保存模型设置
        </Button>
        <span className="inline-flex items-center gap-2 border-2 border-black bg-[#fff200] px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Zap className="h-4 w-4" />
          当前积分 {form.credits ?? 0}
        </span>
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <KeyRound className="h-4 w-4" />
          自带 Key 不消耗服务器积分
        </span>
      </div>
      {message ? <p className="border-2 border-black bg-white p-3 text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{message}</p> : null}
    </div>
  );
}
