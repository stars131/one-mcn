"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, MessageSquareText, Pencil, Plus, Save, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { platformLabels } from "@/lib/platforms/registry";

type IpProfile = {
  id: string;
  name: string;
  niche: string;
  targetAudience: string;
  userPainPoints: string[];
  valueProposition: string;
  toneStyle: string;
  platforms: string[];
  monetizationGoals: string[];
  keywords: string[];
  competitors: string[];
  blockedTopics: string[];
  notes: string[];
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type PersonaOption = {
  label: string;
  value: string;
  description?: string;
};

const arrayFields: { key: keyof IpProfile; label: string; placeholder: string }[] = [
  { key: "platforms", label: "平台", placeholder: "小红书、公众号、抖音" },
  { key: "keywords", label: "关键词", placeholder: "AI、自媒体、增长" },
  { key: "userPainPoints", label: "用户痛点", placeholder: "不知道写什么、内容不稳定" },
  { key: "monetizationGoals", label: "商业化目标", placeholder: "课程、咨询、社群" },
  { key: "competitors", label: "参考对象", placeholder: "账号名或品牌名" },
  { key: "blockedTopics", label: "禁用话题", placeholder: "不碰的领域或表达" }
];

const textFields: { key: keyof IpProfile; label: string; placeholder: string }[] = [
  { key: "name", label: "名称", placeholder: "小八的人设" },
  { key: "niche", label: "赛道", placeholder: "你的核心领域" },
  { key: "targetAudience", label: "目标用户", placeholder: "谁最需要你" },
  { key: "valueProposition", label: "价值主张", placeholder: "你能持续提供什么价值" },
  { key: "toneStyle", label: "语气风格", placeholder: "专业、清晰、可执行" }
];

const starterOptions: PersonaOption[] = [
  { label: "从零开始", value: "我从零开始做人设，请先问我第一个最关键的问题。", description: "适合还没有明确方向" },
  { label: "我已有账号", value: "我已经有账号了，请先帮我诊断并梳理现有人设。", description: "从现状做定位优化" },
  { label: "先定平台", value: "我想先确定适合我的平台，再反推人设。", description: "围绕平台建立内容表达" },
  { label: "先找变现", value: "我想先找到变现方向，再确定人设和内容。", description: "围绕商业目标设计人设" }
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "我是你的人设确定 Agent。我们不用一次想清楚，我会像 GPT 对话一样逐步问问题，每轮给你选项；你点选或补充后，我会把答案沉淀进右侧人设卡。"
  }
];

function emptyProfile(): IpProfile {
  return {
    id: "",
    name: "小八的人设",
    niche: "",
    targetAudience: "",
    userPainPoints: [],
    valueProposition: "",
    toneStyle: "专业、清晰、可执行",
    platforms: [],
    monetizationGoals: [],
    keywords: [],
    competitors: [],
    blockedTopics: [],
    notes: []
  };
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeProfile(item: Partial<IpProfile>): IpProfile {
  return {
    ...emptyProfile(),
    ...item,
    userPainPoints: asArray(item.userPainPoints),
    platforms: asArray(item.platforms),
    monetizationGoals: asArray(item.monetizationGoals),
    keywords: asArray(item.keywords),
    competitors: asArray(item.competitors),
    blockedTopics: asArray(item.blockedTopics),
    notes: asArray(item.notes)
  };
}

function splitList(value: string) {
  return value
    .split(/[,\n，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueList(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function profilePayload(profile: IpProfile) {
  const { id, ...payload } = profile;
  return payload;
}

function chatId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function mergeProfile(current: IpProfile, patch: Partial<IpProfile>, userInput: string) {
  return normalizeProfile({
    ...current,
    ...patch,
    userPainPoints: uniqueList([...(current.userPainPoints || []), ...asArray(patch.userPainPoints)]),
    platforms: uniqueList([...(current.platforms || []), ...asArray(patch.platforms)]),
    monetizationGoals: uniqueList([...(current.monetizationGoals || []), ...asArray(patch.monetizationGoals)]),
    keywords: uniqueList([...(current.keywords || []), ...asArray(patch.keywords)]).slice(0, 24),
    competitors: uniqueList([...(current.competitors || []), ...asArray(patch.competitors)]),
    blockedTopics: uniqueList([...(current.blockedTopics || []), ...asArray(patch.blockedTopics)]),
    notes: uniqueList([`用户选择：${userInput}`, ...asArray(patch.notes), ...current.notes]).slice(0, 30)
  });
}

export function IpProfileConversation() {
  const [profiles, setProfiles] = useState<IpProfile[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<IpProfile>(emptyProfile());
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [agentOptions, setAgentOptions] = useState<PersonaOption[]>(starterOptions);
  const [completion, setCompletion] = useState<{ score: number; missing: string[] }>({ score: 0, missing: ["定位", "目标用户", "平台", "商业化"] });
  const [collecting, setCollecting] = useState(false);

  const selected = useMemo(() => profiles.find((profile) => profile.id === selectedId), [profiles, selectedId]);

  async function load() {
    const res = await fetch("/api/ip-profiles");
    if (!res.ok) throw new Error("加载失败");
    const data = (await res.json()).map((item: Partial<IpProfile>) => normalizeProfile(item));
    setProfiles(data);
    const current = data.find((item: IpProfile) => item.id === selectedId) || data[0];
    if (current) {
      setSelectedId(current.id);
      setDraft(current);
    }
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (selected) setDraft(selected);
  }, [selected]);

  async function saveProfile(next: IpProfile) {
    const isNew = !next.id;
    const res = await fetch(isNew ? "/api/ip-profiles" : `/api/ip-profiles/${next.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload(next))
    });
    if (!res.ok) throw new Error((await res.json()).error || "保存失败");
    const saved = normalizeProfile(await res.json());
    setSelectedId(saved.id);
    await load();
    return saved;
  }

  async function sendToPersonaAgent(value: string) {
    const trimmed = value.trim();
    if (!trimmed || collecting) return;
    const userMessage: ChatMessage = { id: chatId(), role: "user", content: trimmed };
    const nextConversation = [...chatMessages, userMessage];
    setChatMessages(nextConversation);
    setInput("");
    setCollecting(true);
    setMessage("");

    try {
      const agentRes = await fetch("/api/ip-profiles/agent-collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentProfile: profilePayload(draft),
          note: trimmed,
          conversation: nextConversation.map(({ role, content }) => ({ role, content }))
        })
      });
      if (!agentRes.ok) throw new Error((await agentRes.json()).error || "人设 Agent 失败");
      const agentData = await agentRes.json();
      const nextProfile = mergeProfile(draft, agentData.patch || {}, trimmed);
      const saved = await saveProfile(nextProfile);
      const assistantMessage: ChatMessage = {
        id: chatId(),
        role: "assistant",
        content: String(agentData.assistantMessage || "我已记录。我们继续补齐下一块人设信息。")
      };
      setDraft(saved);
      setChatMessages((current) => [...current, assistantMessage]);
      setAgentOptions(Array.isArray(agentData.options) && agentData.options.length ? agentData.options : starterOptions);
      setCompletion({
        score: Number(agentData.completion?.score || 0),
        missing: Array.isArray(agentData.completion?.missing) ? agentData.completion.missing : []
      });
      setMessage("人设 Agent 已更新资料");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setCollecting(false);
    }
  }

  async function saveDraft() {
    try {
      const saved = await saveProfile(draft);
      setDraft(saved);
      setMessage("修改已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    }
  }

  function updateField(key: keyof IpProfile, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateArrayField(key: keyof IpProfile, value: string) {
    setDraft((current) => ({ ...current, [key]: splitList(value) }));
  }

  function togglePlatform(platform: string) {
    setDraft((current) => {
      const platforms = current.platforms.includes(platform)
        ? current.platforms.filter((item) => item !== platform)
        : [...current.platforms, platform];
      return { ...current, platforms };
    });
  }

  function newProfile() {
    setSelectedId("");
    setDraft(emptyProfile());
    setChatMessages(initialMessages);
    setAgentOptions(starterOptions);
    setCompletion({ score: 0, missing: ["定位", "目标用户", "平台", "商业化"] });
    setMessage("正在创建新的人设");
  }

  const summaryItems = [
    ["定位", draft.niche || "待确定"],
    ["目标用户", draft.targetAudience || "待确定"],
    ["价值主张", draft.valueProposition || "待确定"],
    ["语气", draft.toneStyle || "待确定"]
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">人设</h1>
          <p className="mt-1 text-sm text-muted-foreground">像和 GPT 对话一样逐步确定人设，系统会把每次选择沉淀到资料里。</p>
        </div>
        <Button variant="outline" onClick={newProfile}>
          <Plus className="h-4 w-4" />
          新建人设
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" />
            <CardTitle>人设 Agent</CardTitle>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {starterOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                className="border-2 border-black bg-[#fff200] p-3 text-left text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-0.5"
                onClick={() => sendToPersonaAgent(option.value)}
              >
                {option.label}
                <span className="mt-2 block text-xs text-black/60">{option.description}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 max-h-[520px] space-y-3 overflow-auto border-2 border-black bg-[#fffef0] p-3">
            {chatMessages.map((item) => (
              <div key={item.id} className={item.role === "assistant" ? "flex items-start gap-2" : "flex flex-row-reverse items-start gap-2"}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-white">
                  {item.role === "assistant" ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                </span>
                <div className={item.role === "assistant" ? "max-w-[86%] border-2 border-black bg-white p-3 text-sm leading-6" : "max-w-[86%] border-2 border-black bg-[#fff200] p-3 text-sm font-medium leading-6"}>
                  {item.content}
                </div>
              </div>
            ))}
            {collecting ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-pulse" />
                人设 Agent 正在思考下一步问题...
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {agentOptions.map((option) => (
              <button
                key={`${option.label}-${option.value}`}
                type="button"
                className="border-2 border-black bg-white px-3 py-2 text-left text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => sendToPersonaAgent(option.value)}
              >
                {option.label}
                {option.description ? <span className="ml-2 text-xs text-black/50">{option.description}</span> : null}
              </button>
            ))}
          </div>

          <Textarea
            className="mt-4 min-h-24"
            value={input}
            placeholder="也可以直接补充：你的经历、想服务的人、平台倾向、表达风格、变现目标或不想碰的话题。"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") sendToPersonaAgent(input);
            }}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={() => sendToPersonaAgent(input)} disabled={collecting || !input.trim()}>
              <Sparkles className="h-4 w-4" />
              {collecting ? "生成下一问" : "发送给人设 Agent"}
            </Button>
            <span className="text-sm text-muted-foreground">{message}</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>人设卡</CardTitle>
          </div>
          <div className="mt-4 border-2 border-black bg-[#fff200] p-3">
            <p className="text-sm text-black/60">完成度</p>
            <p className="mt-1 text-3xl font-semibold">{Math.round(completion.score || 0)}%</p>
            {completion.missing.length ? <p className="mt-2 text-xs text-black/60">待补齐：{completion.missing.join("、")}</p> : null}
          </div>
          <div className="mt-4 grid gap-3">
            {summaryItems.map(([label, value]) => (
              <div key={label} className="border-2 border-black bg-white p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold leading-6">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">平台</p>
            <div className="flex flex-wrap gap-2">
              {(draft.platforms.length ? draft.platforms : ["待确定"]).map((item) => (
                <span key={item} className="border-2 border-black bg-white px-2 py-1 text-xs font-semibold">{item}</span>
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">最近沉淀</p>
            <div className="grid gap-2">
              {draft.notes.slice(0, 5).map((item, index) => (
                <div key={`${item}-${index}`} className="border-2 border-black bg-white p-2 text-xs leading-5">{item}</div>
              ))}
              {!draft.notes.length ? <p className="text-sm text-muted-foreground">还没有对话记录。</p> : null}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <Pencil className="h-5 w-5 text-primary" />
          <CardTitle>资料展示与修改</CardTitle>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {textFields.map((field) => (
            <label key={field.key} className={field.key === "valueProposition" ? "space-y-1 text-sm md:col-span-2" : "space-y-1 text-sm"}>
              <span className="text-muted-foreground">{field.label}</span>
              {field.key === "valueProposition" ? (
                <Textarea value={String(draft[field.key] || "")} placeholder={field.placeholder} onChange={(event) => updateField(field.key, event.target.value)} />
              ) : (
                <Input value={String(draft[field.key] || "")} placeholder={field.placeholder} onChange={(event) => updateField(field.key, event.target.value)} />
              )}
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {arrayFields.map((field) => (
            <label key={field.key} className="space-y-1 text-sm">
              <span className="text-muted-foreground">{field.label}</span>
              {field.key === "platforms" ? (
                <div className="flex min-h-24 flex-wrap content-start gap-2 border-2 border-black bg-white p-2">
                  {platformLabels.map((platform) => {
                    const active = draft.platforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        className={active ? "border-2 border-black bg-[#fff200] px-3 py-2 text-sm font-semibold" : "border-2 border-black bg-white px-3 py-2 text-sm font-semibold"}
                        onClick={() => togglePlatform(platform)}
                      >
                        {platform}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Textarea
                  className="min-h-24"
                  value={(draft[field.key] as string[]).join("，")}
                  placeholder={field.placeholder}
                  onChange={(event) => updateArrayField(field.key, event.target.value)}
                />
              )}
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={saveDraft}>
            <Save className="h-4 w-4" />
            保存修改
          </Button>
          {!!profiles.length && (
            <select className="h-9 rounded-none border-2 border-black bg-white px-3 text-sm" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>
    </div>
  );
}
