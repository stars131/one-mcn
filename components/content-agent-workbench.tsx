"use client";

import { useEffect, useState } from "react";
import { Bot, FileText, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Select, Textarea } from "@/components/ui/input";
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
  const [loading, setLoading] = useState(false);
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
      setMessage("预览已更新");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "内容 Agent 失败");
    } finally {
      setLoading(false);
    }
  }

  const lastAssistant = [...messages].reverse().find((item) => item.role === "assistant");
  const lastUser = [...messages].reverse().find((item) => item.role === "user");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">内容 Agent</h1>
          <p className="mt-1 text-sm text-muted-foreground">用对话采集创作需求，下方实时预览内容骨架。</p>
        </div>
        <span className="rounded-[999px] border border-stone-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-olive-800">{message || "等待输入"}</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="flex min-h-[calc(100vh-12rem)] flex-col rounded-[2.5rem] border-stone-300/80 bg-amber-50/75 shadow-[0_24px_70px_rgba(120,96,62,0.14)]">
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

          <div className="mt-4 flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={`${option.label}-${option.value}`}
                type="button"
                className="rounded-[999px] border border-stone-200 bg-white/65 px-3 py-1.5 text-left text-xs font-semibold text-stone-600 transition hover:bg-amber-100 hover:text-stone-800"
                onClick={() => send(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <Textarea
              className="min-h-24 bg-white/80"
              value={input}
              placeholder="告诉内容 Agent 你想创作什么..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") send(input);
              }}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => send(input)} disabled={loading || !input.trim()}>
                {loading ? <LoadingDots /> : <Send className="h-4 w-4" />}
                发送
              </Button>
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
                <div>
                  <p className="text-xs text-muted-foreground">标题</p>
                  <p className="mt-1 font-semibold">{preview.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">开头</p>
                  <p className="mt-1 leading-6">{preview.hook}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">正文</p>
                  <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-[1.5rem] bg-amber-50 p-3 leading-6">{preview.body}</pre>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CTA</p>
                  <p className="mt-1 leading-6">{preview.cta}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(preview.tags || []).map((tag) => <span key={tag} className="rounded-[999px] bg-olive-100 px-2 py-1 text-xs font-semibold text-olive-800">{tag}</span>)}
                </div>
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
                  <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.platform} · {item.contentType}</p>
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
