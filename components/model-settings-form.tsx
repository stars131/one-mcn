"use client";

import { useState } from "react";
import { Check, KeyRound, Plus, Save, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

type ModelMode = "server_credits" | "custom";
type UserModelConfig = {
  id?: string;
  name: string;
  provider: string;
  baseUrl: string;
  textModel: string;
  multimodalModel: string;
  imageModel: string;
  hasKey?: boolean;
  apiKey?: string;
};
type ModelSettings = {
  mode: ModelMode;
  selectedConfigId?: string | null;
  credits?: number;
  configs: UserModelConfig[];
};

function newConfig(): UserModelConfig {
  return {
    name: "我的模型",
    provider: "newapi",
    baseUrl: "",
    textModel: "",
    multimodalModel: "",
    imageModel: ""
  };
}

export function ModelSettingsForm({ initial }: { initial: ModelSettings }) {
  const [mode, setMode] = useState<ModelMode>(initial.mode);
  const [selectedConfigId, setSelectedConfigId] = useState(initial.selectedConfigId || initial.configs[0]?.id || "");
  const [configs, setConfigs] = useState<UserModelConfig[]>(initial.configs.length ? initial.configs : [newConfig()]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isCreditsMode = mode === "server_credits";

  function updateConfig(index: number, patch: Partial<UserModelConfig>) {
    setConfigs((current) => current.map((config, itemIndex) => (itemIndex === index ? { ...config, ...patch } : config)));
  }

  function addConfig() {
    setMode("custom");
    setConfigs((current) => [...current, { ...newConfig(), name: `我的模型 ${current.length + 1}` }]);
  }

  function removeConfig(index: number) {
    setConfigs((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      if (selectedConfigId === current[index]?.id) setSelectedConfigId(next[0]?.id || "");
      return next.length ? next : [newConfig()];
    });
  }

  async function save() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings/model-preference", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          selectedConfigId,
          configs: mode === "custom" ? configs : []
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || "保存失败");
      const data = await res.json();
      const saved = data.configs?.map((config: any) => ({ ...config, hasKey: Boolean(config.apiKey), apiKey: "" })) || [];
      if (saved.length) {
        setConfigs(saved);
        setSelectedConfigId(data.preference?.selectedConfigId || saved[0]?.id || "");
      }
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
          ["server_credits", "积分制", "只显示积分，平台统一提供模型服务"],
          ["custom", "自用模型", "维护多套自己的模型配置"]
        ].map(([itemMode, title, text]) => {
          const active = mode === itemMode;
          return (
            <button
              key={itemMode}
              type="button"
              className={`border-2 border-black p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${active ? "bg-[#fff200] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white"}`}
              onClick={() => setMode(itemMode as ModelMode)}
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
          <p className="text-sm font-bold text-black/60">当前可用积分</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <p className="text-6xl font-black leading-none">{initial.credits ?? 0}</p>
            <Zap className="h-10 w-10 text-[#ff2d55]" />
          </div>
        </div>
      ) : (
        <div className="animate-[panel-in_180ms_ease-out] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-black">
              <KeyRound className="h-5 w-5" />
              自用模型列表
            </div>
            <Button variant="outline" onClick={addConfig}>
              <Plus className="h-4 w-4" />
              新增模型
            </Button>
          </div>

          <div className="space-y-4">
            {configs.map((config, index) => (
              <details key={config.id || index} open={index === 0} className="border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <summary className="cursor-pointer font-black">
                  {config.name || `模型 ${index + 1}`}
                  {selectedConfigId && selectedConfigId === config.id ? <span className="ml-2 bg-[#00e5ff] px-2 py-0.5 text-xs">当前使用</span> : null}
                </summary>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="font-semibold">名称</span>
                    <Input value={config.name} onChange={(event) => updateConfig(index, { name: event.target.value })} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-semibold">Provider</span>
                    <Select value={config.provider} onChange={(event) => updateConfig(index, { provider: event.target.value })}>
                      <option value="newapi">newapi</option>
                      <option value="openai">openai</option>
                      <option value="openrouter">openrouter</option>
                      <option value="deepseek">deepseek</option>
                    </Select>
                  </label>
                  <label className="space-y-1 text-sm md:col-span-2">
                    <span className="font-semibold">Base URL</span>
                    <Input value={config.baseUrl} onChange={(event) => updateConfig(index, { baseUrl: event.target.value })} placeholder="https://api.example.com" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-semibold">语言模型</span>
                    <Input value={config.textModel} onChange={(event) => updateConfig(index, { textModel: event.target.value })} placeholder="model-name" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-semibold">多模态模型</span>
                    <Input value={config.multimodalModel} onChange={(event) => updateConfig(index, { multimodalModel: event.target.value })} placeholder="model-name" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-semibold">生图模型</span>
                    <Input value={config.imageModel} onChange={(event) => updateConfig(index, { imageModel: event.target.value })} placeholder="model-name" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-semibold">API Key</span>
                    <Input type="password" value={config.apiKey || ""} onChange={(event) => updateConfig(index, { apiKey: event.target.value })} placeholder={config.hasKey ? "已配置，留空不修改" : "请输入 API Key"} />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setSelectedConfigId(config.id || "")} disabled={!config.id}>
                    设为当前
                  </Button>
                  <Button variant="ghost" onClick={() => removeConfig(index)}>
                    <Trash2 className="h-4 w-4" />
                    删除
                  </Button>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <Button onClick={save} disabled={loading}>
        <Save className="h-4 w-4" />
        保存
      </Button>
      {message ? <p className="border-2 border-black bg-white p-3 text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{message}</p> : null}
    </div>
  );
}
