"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { MarkdownEditor } from "@/components/markdown-editor";

type Field = { name: string; label: string; type?: "text" | "textarea" | "number" | "select" | "json" | "date" | "markdown"; options?: string[]; placeholder?: string };

function parseValue(field: Field, value: string) {
  if (field.type === "number") return Number(value || 0);
  if (field.type === "json") return value ? JSON.parse(value) : [];
  return value;
}

export function ResourceWorkbench({ title, description, endpoint, fields, actions = [] }: { title: string; description: string; endpoint: string; fields: Field[]; actions?: { label: string; path: string; method?: "POST" | "PUT"; body?: Record<string, unknown> }[] }) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch(endpoint);
    setItems(await res.json());
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, [endpoint]);

  async function submit() {
    try {
      const payload = Object.fromEntries(fields.map((f) => [f.name, parseValue(f, form[f.name] || "")]));
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error || "保存失败");
      setForm({});
      setMessage("已保存");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function runAction(item: any, action: { label: string; path: string; method?: "POST" | "PUT"; body?: Record<string, unknown> }) {
    try {
      const url = action.path.replace(":id", item.id);
      const res = await fetch(url, { method: action.method || "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action.body || {}) });
      if (!res.ok) throw new Error((await res.json()).error || "操作失败");
      setMessage(`${action.label} 已执行`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardTitle>新增</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="space-y-1 text-sm">
              <span className="text-muted-foreground">{field.label}</span>
              {field.type === "markdown" ? (
                <MarkdownEditor value={form[field.name] || ""} placeholder={field.placeholder} onChange={(value) => setForm({ ...form, [field.name]: value })} />
              ) : field.type === "textarea" || field.type === "json" ? (
                <Textarea value={form[field.name] || ""} placeholder={field.placeholder} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
              ) : field.type === "select" ? (
                <Select value={form[field.name] || ""} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}>
                  <option value="">请选择</option>
                  {field.options?.map((o) => <option key={o}>{o}</option>)}
                </Select>
              ) : (
                <Input type={field.type === "date" ? "datetime-local" : "text"} value={form[field.name] || ""} placeholder={field.placeholder} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
              )}
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={submit}>保存</Button>
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </Card>
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{item.title || item.name || item.platform || item.summary || item.id}</CardTitle>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{item.summary || item.corePoint || item.body || item.reason || item.status || item.type}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => <Button key={action.label} variant="outline" onClick={() => runAction(item, action)}>{action.label}</Button>)}
              </div>
            </div>
            <pre className="mt-3 max-h-48 overflow-auto rounded-none bg-muted p-3 text-xs">{JSON.stringify(item, null, 2)}</pre>
          </Card>
        ))}
        {!items.length && <Card className="text-sm text-muted-foreground">暂无数据，先创建一条记录。</Card>}
      </div>
    </div>
  );
}
