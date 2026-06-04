"use client";

import { useEffect, useState } from "react";
import { Bot, History, Pencil, Plus, Save, Sparkles, UserRound } from "lucide-react";
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

type PersonaMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt?: string;
};

type PersonaOption = {
  label: string;
  value: string;
  description?: string;
};

type PersonaConversation = {
  id: string;
  title: string;
  currentPrompt?: string | null;
  lastUserAnswer?: string | null;
  lastAssistantReply?: string | null;
  options?: PersonaOption[];
  completion?: { score?: number; missing?: string[] };
  updatedAt?: string;
  messages?: PersonaMessage[];
  ipProfile?: Partial<IpProfile> | null;
};

const starterOptions: PersonaOption[] = [
  { label: "从零开始", value: "我从零开始做人设，请先问我第一个最关键的问题。" },
  { label: "我已有账号", value: "我已经有账号了，请先帮我诊断并梳理现有人设。" },
  { label: "先定平台", value: "我想先确定适合我的平台，再反推人设。" },
  { label: "先找变现", value: "我想先找到变现方向，再确定人设和内容。" }
];

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

function normalizeProfile(item?: Partial<IpProfile> | null): IpProfile {
  return {
    ...emptyProfile(),
    ...(item || {}),
    userPainPoints: asArray(item?.userPainPoints),
    platforms: asArray(item?.platforms),
    monetizationGoals: asArray(item?.monetizationGoals),
    keywords: asArray(item?.keywords),
    competitors: asArray(item?.competitors),
    blockedTopics: asArray(item?.blockedTopics),
    notes: asArray(item?.notes)
  };
}

function splitList(value: string) {
  return value
    .split(/[,\n，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function profilePayload(profile: IpProfile) {
  const { id, ...payload } = profile;
  return payload;
}

function lastByRole(messages: PersonaMessage[] | undefined, role: "assistant" | "user") {
  return [...(messages || [])].reverse().find((message) => message.role === role);
}

export function IpProfileConversation() {
  const [conversations, setConversations] = useState<PersonaConversation[]>([]);
  const [current, setCurrent] = useState<PersonaConversation | null>(null);
  const [draft, setDraft] = useState<IpProfile>(emptyProfile());
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  async function loadConversations(selectId?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/persona-conversations");
      if (!res.ok) throw new Error("加载会话失败");
      let list = await res.json();
      if (!Array.isArray(list) || !list.length) {
        const created = await fetch("/api/persona-conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "新的人设对话" })
        });
        if (!created.ok) throw new Error("创建会话失败");
        const item = await created.json();
        list = [item];
      }
      setConversations(list);
      await selectConversation(selectId || list[0].id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function selectConversation(id: string) {
    const res = await fetch(`/api/persona-conversations/${id}`);
    if (!res.ok) throw new Error("加载会话失败");
    const item = await res.json();
    setCurrent(item);
    setDraft(normalizeProfile(item.ipProfile));
    setInput("");
  }

  useEffect(() => {
    loadConversations().catch((error) => setMessage(error.message));
  }, []);

  async function newConversation() {
    setMessage("");
    const res = await fetch("/api/persona-conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新的人设对话" })
    });
    if (!res.ok) {
      setMessage("创建会话失败");
      return;
    }
    const item = await res.json();
    setConversations((items) => [item, ...items]);
    setCurrent(item);
    setDraft(normalizeProfile(item.ipProfile));
    setInput("");
  }

  async function sendToPersonaAgent(value: string) {
    const trimmed = value.trim();
    if (!trimmed || !current || sending) return;
    setSending(true);
    setMessage("");
    setInput("");
    try {
      const res = await fetch(`/api/persona-conversations/${current.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed })
      });
      if (!res.ok) throw new Error((await res.json()).error || "人设 Agent 失败");
      const data = await res.json();
      setCurrent(data.conversation);
      setDraft(normalizeProfile(data.ipProfile));
      await loadConversations(data.conversation.id);
      setMessage("已留档，并进入下一问");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "发送失败");
    } finally {
      setSending(false);
    }
  }

  async function saveDraft() {
    if (!draft.id) return;
    try {
      const res = await fetch(`/api/ip-profiles/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload(draft))
      });
      if (!res.ok) throw new Error((await res.json()).error || "保存失败");
      setDraft(normalizeProfile(await res.json()));
      setMessage("修改已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    }
  }

  function updateField(key: keyof IpProfile, value: string) {
    setDraft((item) => ({ ...item, [key]: value }));
  }

  function updateArrayField(key: keyof IpProfile, value: string) {
    setDraft((item) => ({ ...item, [key]: splitList(value) }));
  }

  function togglePlatform(platform: string) {
    setDraft((item) => ({
      ...item,
      platforms: item.platforms.includes(platform) ? item.platforms.filter((value) => value !== platform) : [...item.platforms, platform]
    }));
  }

  const lastUser = lastByRole(current?.messages, "user");
  const lastAssistant = lastByRole(current?.messages, "assistant");
  const currentOptions = Array.isArray(current?.options) && current?.options?.length ? current.options : starterOptions;
  const completionScore = Number(current?.completion?.score || 0);
  const prompt = lastAssistant?.content || current?.currentPrompt || "我们先从一个方向开始。";

  return (
    <div className="grid min-h-[calc(100vh-118px)] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[2rem] border border-stone-200 bg-card/85 p-3 shadow-[0_16px_36px_rgba(120,96,62,0.10)]">
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-olive-700" />
            <span className="text-sm font-semibold">人设对话</span>
          </div>
          <Button variant="ghost" onClick={newConversation}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 space-y-1">
          {conversations.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === current?.id ? "w-full rounded-[1.25rem] bg-olive-100 px-3 py-2 text-left text-sm font-semibold text-olive-800" : "w-full rounded-[1.25rem] px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-amber-100 hover:text-foreground"}
              onClick={() => selectConversation(item.id).catch((error) => setMessage(error.message))}
            >
              <span className="block truncate">{item.title}</span>
              <span className="mt-1 block truncate text-xs opacity-70">{item.lastUserAnswer || "还没有回答"}</span>
            </button>
          ))}
          {!conversations.length && !loading ? <p className="px-3 py-2 text-sm text-muted-foreground">暂无会话</p> : null}
        </div>
      </aside>

      <main className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">人设</h1>
            <p className="mt-1 text-sm text-muted-foreground/80">旧对话自动留档，当前只显示上一轮回答和下一问。</p>
          </div>
          <span className="rounded-[999px] bg-white/70 px-3 py-1 text-xs font-semibold text-olive-800">{Math.round(completionScore)}%</span>
        </div>

        <Card className="rounded-[2.5rem] border-stone-300/80 bg-amber-50/75 p-4 shadow-[0_24px_70px_rgba(120,96,62,0.16)] sm:p-6">
          <div className="min-h-[520px] rounded-[2rem] border border-stone-200 bg-[#fbf7ef] p-4 shadow-inner sm:p-6">
            {lastUser ? (
              <div className="mb-5 flex flex-row-reverse items-start gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[38%_62%_44%_56%/52%_38%_62%_48%] border border-stone-200 bg-amber-50">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="max-w-[86%] rounded-[1.75rem] border border-olive-700/15 bg-amber-100 px-4 py-3 text-sm font-medium leading-6">
                  {lastUser.content}
                </div>
              </div>
            ) : null}

            <div className="flex items-start gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[38%_62%_44%_56%/52%_38%_62%_48%] border border-stone-200 bg-amber-50">
                <Bot className="h-4 w-4" />
              </span>
              <div className="max-w-[86%] rounded-[1.75rem] border border-stone-200 bg-white/90 px-4 py-3 text-sm leading-6 shadow-[0_8px_24px_rgba(120,96,62,0.06)]">
                {prompt}
              </div>
            </div>

            {sending ? (
              <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-pulse" />
                人设 Agent 正在思考下一步问题...
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 px-1">
            {currentOptions.map((option) => (
              <button
                key={`${option.label}-${option.value}`}
                type="button"
                className="rounded-[999px] border border-stone-200 bg-white/65 px-3 py-1.5 text-left text-xs font-semibold text-stone-600 transition hover:bg-amber-100 hover:text-stone-800"
                onClick={() => sendToPersonaAgent(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Textarea
            className="mt-3 min-h-28 bg-white/80"
            value={input}
            placeholder="回答当前问题..."
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") sendToPersonaAgent(input);
            }}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3 px-1">
            <Button onClick={() => sendToPersonaAgent(input)} disabled={sending || !input.trim() || !current}>
              <Sparkles className="h-4 w-4" />
              {sending ? "生成下一问" : "发送"}
            </Button>
            <span className="text-sm text-muted-foreground">{message}</span>
          </div>
        </Card>

        <details className="rounded-[2rem] border border-stone-200 bg-card/90 p-4 shadow-[0_16px_36px_rgba(120,96,62,0.10)]">
          <summary className="cursor-pointer text-sm font-semibold">查看完整留档</summary>
          <div className="mt-4 max-h-72 space-y-2 overflow-auto text-sm">
            {(current?.messages || []).map((item) => (
              <div key={item.id} className="rounded-[1.25rem] bg-amber-50 p-3">
                <p className="text-xs text-muted-foreground">{item.role === "assistant" ? "Agent" : "我"}</p>
                <p className="mt-1 leading-6">{item.content}</p>
              </div>
            ))}
          </div>
        </details>

        <details className="rounded-[2rem] border border-stone-200 bg-card/90 p-4 shadow-[0_16px_36px_rgba(120,96,62,0.10)]">
          <summary className="cursor-pointer text-sm font-semibold">编辑详细资料</summary>
          <div className="mt-4 flex items-center gap-2">
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
                  <div className="flex min-h-24 flex-wrap content-start gap-2 rounded-[1.5rem] border border-stone-200 bg-amber-50/70 p-2">
                    {platformLabels.map((platform) => {
                      const active = draft.platforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          type="button"
                          className={active ? "rounded-[999px] border border-olive-700/20 bg-olive-100 px-3 py-2 text-sm font-semibold text-olive-800" : "rounded-[999px] border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700"}
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
            <Button onClick={saveDraft} disabled={!draft.id}>
              <Save className="h-4 w-4" />
              保存修改
            </Button>
          </div>
        </details>
      </main>
    </div>
  );
}
