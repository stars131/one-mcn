"use client";

import { useEffect, useState } from "react";
import { subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ReportsWorkbench() {
  const [reports, setReports] = useState<any[]>([]);
  const [periodStart, setPeriodStart] = useState(subDays(new Date(), 30).toISOString().slice(0, 10));
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  async function load() { setReports(await fetch("/api/reports").then((r) => r.json())); }
  useEffect(() => { load().catch(console.error); }, []);
  async function generate() {
    const res = await fetch("/api/reports/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ periodStart, periodEnd }) });
    if (!res.ok) setMessage((await res.json()).error || "生成失败");
    else { setMessage("复盘报告已生成"); await load(); }
  }
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-semibold">复盘报告</h1><p className="mt-1 text-sm text-muted-foreground">选择周期生成 AI 复盘，查看历史报告和下一轮选题建议。</p></div>
    <Card><CardTitle>生成复盘</CardTitle><div className="mt-4 flex flex-wrap gap-3"><Input className="max-w-48" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} /><Input className="max-w-48" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /><Button onClick={generate}>生成 AI 复盘报告</Button><span className="text-sm text-muted-foreground">{message}</span></div></Card>
    {reports.map((report) => <Card key={report.id}><CardTitle>{report.summary || "复盘报告"}</CardTitle><div className="mt-3 grid gap-3 md:grid-cols-2"><pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(report.keyFindings, null, 2)}</pre><pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(report.nextTopics, null, 2)}</pre></div></Card>)}
  </div>;
}
