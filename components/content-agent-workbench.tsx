"use client";

import { useEffect, useState } from "react";
import { Bot, FileText, Pencil, Save, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { contentTypeOptions, defaultPlatform, platformLabels } from "@/lib/platforms/registry";

type Message = { role: "assistant" | "user"; content: string };

type DraftPreview = {
  title?: string;
  titles?: string[];
  coverTexts?: string[];
  hook?: string;
  body?: string;
  cta?: string;
  tags?: string[];
  commentGuide?: string;
};

const starterOptions = [
  { label: "从热点生成", value: "我想从一个热点开始生成内容。" },
  { label: "从选题生成", value: "我已经有选题了，请帮我变成内容初稿。" },
  { label: "先定风格", value: "我想先确定内容风格和语气。" },
  { label: "先做大纲", value: "请先帮我做一个内容大纲。" }
];

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  );
}

export function ContentAgentWorkbench() {
  const [items, setItems] = useState<any[]>([]);
  const [platform, setPlatform] = useState(defaultPlatform);
  const [contentType, setContentType] = useState("图文");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "你想创作什么内容？可以从热点、选题、风格或大纲开始。" }
  ]);
  const [options, setOptions] = useState(starterOptions);
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<DraftPreview | null>(null);
  const [editingId, setEditingId] = useState("");
  const [editor, setEditor] = useState<DraftPreview>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/contents");
    setItems(await res.json());
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  async function send(value: string) {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setMessage("内容 Agent 正在整理预览");
    try {
      const res = await fetch("/api/contents/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed, platform, contentType, conversation: nextMessages })
      });
      if (!res.ok) throw new Error((await res.json()).error || "内容 Agent 失败");
      const data = await res.json();
      setMessages([...nextMessages, { role: "assistant", content: data.assistantMessage }]);
      setOptions(Array.isArray(data.options) && data.options.length ? data.options : starterOptions);
      setPreview(data.draftPreview);
      setEditor(data.draftPreview || {});
      setEditingId("");
      setMessage("预览已更新");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "内容 Agent 失败");
    } finally {
      setLoading(false);
    }
  }

  const lastAssistant = [...messages].reverse().find((item) => item.role === "assistant");
  const lastUser = [...messages].reverse().find((item) => item.role === "user");

  function editDraft(item: any) {
    const draft = {
      title: item.title || "",
      titles: Array.isArray(item.titles) ? item.titles : [],
      coverTexts: Array.isArray(item.coverTexts) ? item.coverTexts : [],
      hook: item.hook || "",
      body: item.body || "",
      cta: item.cta || "",
      tags: Array.isArray(item.tags) ? item.tags : [],
      commentGuide: item.commentGuide || ""
    };
    setEditingId(item.id);
    setPlatform(item.platform || platform);
    setContentType(item.contentType || contentType);
    setPreview(draft);
    setEditor(draft);
    setMessage("草稿已载入编辑器");
  }

  function updateEditor(key: keyof DraftPreview, value: string) {
    const next = key === "tags" || key === "titles" || key === "coverTexts" ? value.split(/[,\n，、]/).map((item) => item.trim()).filter(Boolean) : value;
    setEditor((current) => ({ ...current, [key]: next }));
  }

  async function saveDraft() {
    if (!editingId) {
      setMessage("当前是 Agent 预览，后续会支持保存为新草稿。");
      return;
    }
    setSaving(true);
    setMessage("正在保存草稿");
    try {
      const res = await fetch(`/api/contents/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          contentType,
          title: editor.title || "未命名草稿",
          titles: editor.titles || [],
          coverTexts: editor.coverTexts || [],
          hook: editor.hook || "",
          body: editor.body || "",
          cta: editor.cta || "",
          tags: editor.tags || [],
          commentGuide: editor.commentGuide || ""
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || "保存失败");
      setPreview(editor);
      setMessage("草稿已保存");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">内容 Agent</h1>
          <p className="mt-1 text-sm text-muted-foreground">用对话采集创作需求，下方实时预览内容骨架。</p>
        </div>
        <span className="rounded-[999px] border border-stone-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-olive-800">{message || "等待输入"}</span>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
        <Card className="sticky top-20 flex max-h-[calc(100vh-6rem)] min-h-[calc(100vh-9rem)] flex-col rounded-[2.5rem] border-stone-300/80 bg-amber-50/75 shadow-[0_24px_70px_rgba(120,96,62,0.14)]">
          <div className="shrink-0 rounded-[2rem] border border-stone-200 bg-white/70 p-3 shadow-[0_12px_28px_rgba(120,96,62,0.08)]">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">平台</span>
                <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  {platformLabels.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">内容类型</span>
                <Select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                  {contentTypeOptions.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </label>
            </div>
            <div className="mt-3">
              <Textarea
                className="min-h-20 bg-white/80"
                value={input}
                placeholder="告诉内容 Agent 你想创作什么..."
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") send(input);
                }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => send(input)} disabled={loading || !input.trim()}>
                  {loading ? <LoadingDots /> : <Send className="h-4 w-4" />}
                  发送
                </Button>
                {options.map((option) => (
                  <button
                    key={`${option.label}-${option.value}`}
                    type="button"
                    className="rounded-[999px] border border-stone-200 bg-amber-50 px-3 py-1.5 text-left text-xs font-semibold text-stone-600 transition hover:bg-amber-100 hover:text-stone-800"
                    onClick={() => send(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-auto rounded-[2rem] border border-stone-200 bg-[#fbf7ef] p-4 shadow-inner">
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
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    正在生成预览 <LoadingDots />
                  </span>
                ) : (
                  lastAssistant?.content
                )}
              </div>
            </div>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="rounded-[2rem]">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-olive-700" />
              <CardTitle>内容预览</CardTitle>
            </div>
            {preview ? (
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-[999px] bg-olive-100 px-3 py-1 text-xs font-semibold text-olive-800">{editingId ? "正在编辑草稿" : "Agent 预览"}</span>
                  <Button variant="outline" onClick={saveDraft} disabled={saving}>
                    {saving ? <LoadingDots /> : <Save className="h-4 w-4" />}
                    保存修改
                  </Button>
                </div>
                <label className="space-y-1">
                  <p className="text-xs text-muted-foreground">标题</p>
                  <Input value={editor.title || ""} onChange={(event) => updateEditor("title", event.target.value)} />
                </label>
                <label className="space-y-1">
                  <p className="text-xs text-muted-foreground">开头</p>
                  <Textarea className="min-h-20" value={editor.hook || ""} onChange={(event) => updateEditor("hook", event.target.value)} />
                </label>
                <label className="space-y-1">
                  <p className="text-xs text-muted-foreground">正文</p>
                  <Textarea className="min-h-64" value={editor.body || ""} onChange={(event) => updateEditor("body", event.target.value)} />
                </label>
                <label className="space-y-1">
                  <p className="text-xs text-muted-foreground">CTA</p>
                  <Textarea className="min-h-20" value={editor.cta || ""} onChange={(event) => updateEditor("cta", event.target.value)} />
                </label>
                <label className="space-y-1">
                  <p className="text-xs text-muted-foreground">标签</p>
                  <Input value={(editor.tags || []).join("，")} onChange={(event) => updateEditor("tags", event.target.value)} />
                </label>
              </div>
            ) : (
              <div className="mt-4 rounded-[1.5rem] bg-amber-50 p-4 text-sm leading-6 text-muted-foreground">
                先和内容 Agent 对话，预览会显示在这里。后续会接入真实生成策略、流式输出和保存草稿。
              </div>
            )}
          </Card>

          <Card className="rounded-[2rem]">
            <CardTitle>最近草稿</CardTitle>
            <div className="mt-4 space-y-2">
              {items.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-[1.25rem] bg-amber-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.platform} · {item.contentType}</p>
                    </div>
                    <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => editDraft(item)}>
                      <Pencil className="h-3.5 w-3.5" />
                      编辑
                    </Button>
                  </div>
                </div>
              ))}
              {!items.length ? <p className="text-sm text-muted-foreground">暂无草稿。</p> : null}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
