"use client";

import { useState } from "react";
import { Check, KeyRound, Save, Zap } from "lucide-react";
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
  const isCreditsMode = form.mode === "server_credits";

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
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["server_credits", "积分制", "使用平台模型服务"],
          ["custom", "自用模型", "接入自己的模型 Key"]
        ].map(([mode, title, text]) => {
          const active = form.mode === mode;
          return (
            <button
              key={mode}
              type="button"
              className={`border-2 border-black p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${active ? "bg-[#fff200] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white"}`}
              onClick={() => setForm({ ...form, mode: mode as ModelSettings["mode"] })}
            >
              <span className="flex items-center justify-between gap-3 font-black">
                {title}
                {active ? <Check className="h-4 w-4" /> : null}
              </span>
              <span className="mt-2 block text-sm font-medium text-black/70">{text}</span>
            </button>
          );
        })}
      </div>

      {isCreditsMode ? (
        <div className="animate-[panel-in_180ms_ease-out] border-4 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-black/60">当前可用积分</p>
              <p className="mt-1 text-5xl font-black leading-none">{form.credits ?? 0}</p>
            </div>
            <Zap className="h-10 w-10 text-[#ff2d55]" />
          </div>
        </div>
      ) : (
        <div className="animate-[panel-in_180ms_ease-out] space-y-4 border-4 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 font-black">
            <KeyRound className="h-5 w-5" />
            自用模型配置
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Provider</span>
              <Select value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })}>
                <option value="newapi">newapi</option>
                <option value="openai">openai</option>
                <option value="openrouter">openrouter</option>
                <option value="deepseek">deepseek</option>
              </Select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Base URL</span>
              <Input value={form.baseUrl} onChange={(event) => setForm({ ...form, baseUrl: event.target.value })} placeholder="https://api.example.com" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold">语言模型</span>
              <Input value={form.textModel} onChange={(event) => setForm({ ...form, textModel: event.target.value })} placeholder="model-name" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold">多模态模型</span>
              <Input value={form.multimodalModel} onChange={(event) => setForm({ ...form, multimodalModel: event.target.value })} placeholder="model-name" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold">生图模型</span>
              <Input value={form.imageModel} onChange={(event) => setForm({ ...form, imageModel: event.target.value })} placeholder="model-name" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold">API Key</span>
              <Input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={initial.hasCustomKey ? "已配置，留空不修改" : "请输入你的 API Key"} />
            </label>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={loading}>
          <Save className="h-4 w-4" />
          {isCreditsMode ? "保存为积分制" : "保存自用模型"}
        </Button>
      </div>
      {message ? <p className="border-2 border-black bg-white p-3 text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{message}</p> : null}
    </div>
  );
}
