"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});

  async function load() {
    const [summary, trends, platforms, contentList] = await Promise.all([
      fetch("/api/analytics/summary").then((r) => r.json()),
      fetch("/api/analytics/trends").then((r) => r.json()),
      fetch("/api/analytics/platforms").then((r) => r.json()),
      fetch("/api/contents").then((r) => r.json())
    ]);
    setData({ summary, trends, platforms });
    setContents(contentList);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function submitMetric() {
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentId: form.contentId,
        platform: form.platform || "小红书",
        views: Number(form.views || 0),
        likes: Number(form.likes || 0),
        comments: Number(form.comments || 0),
        saves: Number(form.saves || 0),
        shares: Number(form.shares || 0),
        followersGained: Number(form.followersGained || 0),
        completionRate: Number(form.completionRate || 0),
        clickRate: Number(form.clickRate || 0)
      })
    });
    setForm({});
    await load();
  }

  const totals = data?.summary?.totals || {};
  const rates = data?.summary?.rates || {};
  const cards = [
    ["总内容数", totals.contents], ["总阅读量", totals.views], ["总点赞数", totals.likes], ["总收藏数", totals.saves], ["总评论数", totals.comments], ["总分享数", totals.shares], ["总涨粉数", totals.followersGained], ["平均互动率", `${((rates.engagementRate || 0) * 100).toFixed(1)}%`], ["平均收藏率", `${((rates.saveRate || 0) * 100).toFixed(1)}%`], ["平均转粉率", `${((rates.followerGainRate || 0) * 100).toFixed(1)}%`]
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">数据分析</h1>
        <p className="mt-1 text-sm text-muted-foreground">录入发布数据，查看排行榜、平台对比、标签分析和 7/30 天趋势。</p>
      </div>
      <div className="grid gap-3 md:grid-cols-5">{cards.map(([label, value]) => <Card key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value ?? 0}</p></Card>)}</div>
      <Card>
        <CardTitle>数据录入</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Select value={form.contentId || ""} onChange={(e) => setForm({ ...form, contentId: e.target.value })}><option value="">选择 Content</option>{contents.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</Select>
          {["platform", "views", "likes", "comments", "saves", "shares", "followersGained", "completionRate", "clickRate"].map((key) => <Input key={key} placeholder={key} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
        </div>
        <Button className="mt-4" onClick={submitMetric}>保存并重新计算</Button>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card><CardTitle>近 30 天阅读趋势</CardTitle><div className="mt-4 h-72"><ResponsiveContainer><LineChart data={data?.trends?.trends30 || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line dataKey="views" stroke="#0f8b8d" /></LineChart></ResponsiveContainer></div></Card>
        <Card><CardTitle>平台阅读对比</CardTitle><div className="mt-4 h-72"><ResponsiveContainer><BarChart data={data?.platforms || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="views" fill="#d95d39" /></BarChart></ResponsiveContainer></div></Card>
      </div>
    </div>
  );
}
