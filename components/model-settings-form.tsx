"use client";

import { useState } from "react";
import { Check, KeyRound, Plus, Save, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

type ModelMode = "server_credits" | "custom";
type UserModelConfig = {
  id?: string;
  name: string;
  textProvider: string;
  textBaseUrl: string;
  textModel: string;
  textHasKey?: boolean;
  textApiKey?: string;
  multimodalProvider: string;
  multimodalBaseUrl: string;
  multimodalModel: string;
  multimodalHasKey?: boolean;
  multimodalApiKey?: string;
  imageProvider: string;
  imageBaseUrl: string;
  imageModel: string;
  imageHasKey?: boolean;
  imageApiKey?: string;
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
    textProvider: "newapi",
    textBaseUrl: "",
    textModel: "",
    multimodalProvider: "newapi",
    multimodalBaseUrl: "",
    multimodalModel: "",
    imageProvider: "newapi",
    imageBaseUrl: "",
    imageModel: ""
  };
}

const providers = ["newapi", "openai", "openrouter", "deepseek"];

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
      const saved = data.configs?.map((config: any) => ({ ...config, textHasKey: Boolean(config.textApiKey), multimodalHasKey: Boolean(config.multimodalApiKey), imageHasKey: Boolean(config.imageApiKey), textApiKey: "", multimodalApiKey: "", imageApiKey: "" })) || [];
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
                  {[
                    ["语言模型", "text"],
                    ["多模态模型", "multimodal"],
                    ["生图模型", "image"]
                  ].map(([label, prefix]) => (
                    <div key={prefix} className="space-y-3 border-2 border-black bg-[#fff9bf] p-3 md:col-span-2">
                      <p className="font-black">{label}</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-1 text-sm">
                          <span className="font-semibold">Provider</span>
                          <Select value={(config as any)[`${prefix}Provider`]} onChange={(event) => updateConfig(index, { [`${prefix}Provider`]: event.target.value } as any)}>
                            {providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
                          </Select>
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="font-semibold">模型名</span>
                          <Input value={(config as any)[`${prefix}Model`] || ""} onChange={(event) => updateConfig(index, { [`${prefix}Model`]: event.target.value } as any)} placeholder="model-name" />
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="font-semibold">URL</span>
                          <Input value={(config as any)[`${prefix}BaseUrl`] || ""} onChange={(event) => updateConfig(index, { [`${prefix}BaseUrl`]: event.target.value } as any)} placeholder="https://api.example.com" />
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="font-semibold">Key</span>
                          <Input type="password" value={(config as any)[`${prefix}ApiKey`] || ""} onChange={(event) => updateConfig(index, { [`${prefix}ApiKey`]: event.target.value } as any)} placeholder={(config as any)[`${prefix}HasKey`] ? "已配置，留空不修改" : "请输入 Key"} />
                        </label>
                      </div>
                    </div>
                  ))}
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
