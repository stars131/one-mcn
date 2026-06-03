"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

function renderMarkdown(source: string) {
  return source.split("\n").map((line, index) => {
    if (line.startsWith("### ")) return <h3 key={index} className="mt-4 text-base font-semibold">{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={index} className="mt-5 text-lg font-semibold">{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={index} className="mt-6 text-xl font-semibold">{line.slice(2)}</h1>;
    if (line.startsWith("- ")) return <li key={index} className="ml-5 list-disc">{line.slice(2)}</li>;
    if (!line.trim()) return <div key={index} className="h-3" />;
    return <p key={index} className="leading-7">{line}</p>;
  });
}

export function MarkdownEditor({ value, placeholder, onChange }: { value: string; placeholder?: string; onChange: (value: string) => void }) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const preview = useMemo(() => renderMarkdown(value), [value]);

  return (
    <div className="rounded-none border-2 border-black bg-white">
      <div className="flex items-center gap-2 border-b p-2">
        <Button type="button" variant={mode === "edit" ? "default" : "ghost"} onClick={() => setMode("edit")}>编辑</Button>
        <Button type="button" variant={mode === "preview" ? "default" : "ghost"} onClick={() => setMode("preview")}>预览</Button>
      </div>
      {mode === "edit" ? (
        <Textarea className="min-h-64 border-0 focus:ring-0" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="min-h-64 p-4 text-sm">{preview}</div>
      )}
    </div>
  );
}
