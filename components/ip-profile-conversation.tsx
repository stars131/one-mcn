"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MessageSquareText, Pencil, Plus, Save, Sparkles } from "lucide-react";
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

const arrayFields: { key: keyof IpProfile; label: string; placeholder: string }[] = [
  { key: "platforms", label: "平台", placeholder: "小红书、公众号、抖音" },
  { key: "keywords", label: "关键词", placeholder: "AI、自媒体、增长" },
  { key: "userPainPoints", label: "用户痛点", placeholder: "不知道写什么、内容不稳定" },
  { key: "monetizationGoals", label: "商业化目标", placeholder: "课程、咨询、社群" },
  { key: "competitors", label: "参考对象", placeholder: "账号名或品牌名" },
  { key: "blockedTopics", label: "禁用话题", placeholder: "不碰的领域或表达" }
];

const textFields: { key: keyof IpProfile; label: string; placeholder: string }[] = [
  { key: "name", label: "名称", placeholder: "小八的个人 IP" },
  { key: "niche", label: "赛道", placeholder: "你的核心领域" },
  { key: "targetAudience", label: "目标用户", placeholder: "谁最需要你" },
  { key: "valueProposition", label: "价值主张", placeholder: "你能持续提供什么价值" },
  { key: "toneStyle", label: "语气风格", placeholder: "专业、清晰、可执行" }
];

const promptOptions = [
  "我是新手创作者，想先找到适合我的赛道",
  "我的目标用户是想提高效率的人",
  "我想做小红书和公众号",
  "我想测试抖音、B站和知乎",
  "我的内容需要专业、清晰、可执行",
  "我希望后续可以做课程、咨询或社群"
];

function emptyProfile(): IpProfile {
  return {
    id: "",
    name: "小八的个人 IP",
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

export function IpProfileConversation() {
  const [profiles, setProfiles] = useState<IpProfile[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<IpProfile>(emptyProfile());
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [nextQuestions, setNextQuestions] = useState<string[]>([]);
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

  async function submitNote() {
    const trimmed = note.trim();
    if (!trimmed) return;
    setCollecting(true);
    try {
      const agentRes = await fetch("/api/ip-profiles/agent-collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentProfile: profilePayload(draft), note: trimmed })
      });
      if (!agentRes.ok) throw new Error((await agentRes.json()).error || "AI 采集失败");
      const agentData = await agentRes.json();
      const patch = agentData.patch || {};
      const nextProfile = normalizeProfile({
        ...draft,
        ...patch,
        userPainPoints: uniqueList([...(draft.userPainPoints || []), ...(patch.userPainPoints || [])]),
        platforms: uniqueList([...(draft.platforms || []), ...(patch.platforms || [])]),
        monetizationGoals: uniqueList([...(draft.monetizationGoals || []), ...(patch.monetizationGoals || [])]),
        keywords: uniqueList([...(draft.keywords || []), ...(patch.keywords || [])]).slice(0, 24),
        competitors: uniqueList([...(draft.competitors || []), ...(patch.competitors || [])]),
        blockedTopics: uniqueList([...(draft.blockedTopics || []), ...(patch.blockedTopics || [])]),
        notes: uniqueList([trimmed, ...(patch.notes || []), ...draft.notes]).slice(0, 20)
      });
      const saved = await saveProfile(nextProfile);
      setDraft(saved);
      setNote("");
      setNextQuestions(Array.isArray(agentData.nextQuestions) ? agentData.nextQuestions : []);
      setMessage("AI Agent 已更新个人 IP 资料");
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
    setMessage("正在创建新的 IP 资料");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">个人 IP 定位</h1>
          <p className="mt-1 text-sm text-muted-foreground">先用选项和对话沉淀想法，再在下方微调资料。</p>
        </div>
        <Button variant="outline" onClick={newProfile}>
          <Plus className="h-4 w-4" />
          新建资料
        </Button>
      </div>

      <div className="space-y-5">
        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-primary" />
              <CardTitle>对话式采集</CardTitle>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {promptOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="border-2 border-black bg-[#fff200] px-3 py-2 text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-0.5"
                  onClick={() => setNote((current) => [current, option].filter(Boolean).join("\n"))}
                >
                  {option}
                </button>
              ))}
            </div>
            <Textarea
              className="mt-4 min-h-44"
              value={note}
              placeholder="把你的想法直接写在这里：你是谁、想服务谁、内容边界、平台、商业化方向、最近观察到的用户问题。"
              onChange={(event) => setNote(event.target.value)}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={submitNote} disabled={collecting}>
                <Sparkles className="h-4 w-4" />
                {collecting ? "AI 采集中" : "AI 采集到资料"}
              </Button>
              <span className="text-sm text-muted-foreground">{message}</span>
            </div>
            {nextQuestions.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {nextQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className="border-2 border-black bg-white px-3 py-2 text-left text-sm font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onClick={() => setNote((current) => [current, question].filter(Boolean).join("\n"))}
                  >
                    {question}
                  </button>
                ))}
              </div>
            ) : null}
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle>已累积内容</CardTitle>
            </div>
            <div className="mt-4 grid gap-3">
              {draft.notes.length ? (
                draft.notes.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-none border-2 border-black bg-[#fff200] p-3 text-sm font-medium leading-6">
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">还没有对话记录。</p>
              )}
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
    </div>
  );
}
