"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HotspotSettings = {
  freeHotspotUrl: string;
  paidHotspotUrl: string;
  paidDailyCost: number;
};

export function AdminHotspotSettings({ initial }: { initial: HotspotSettings }) {
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/hotspot-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).error || "保存失败");
      setMessage("已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="space-y-1 text-sm">
        <span className="font-semibold">免费热点接口 URL</span>
        <Input value={form.freeHotspotUrl} onChange={(event) => setForm({ ...form, freeHotspotUrl: event.target.value })} />
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-semibold">付费热点接口 URL</span>
        <Input value={form.paidHotspotUrl} onChange={(event) => setForm({ ...form, paidHotspotUrl: event.target.value })} />
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-semibold">每日付费热点价格（积分）</span>
        <Input type="number" value={form.paidDailyCost} onChange={(event) => setForm({ ...form, paidDailyCost: Number(event.target.value || 0) })} />
      </label>
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={loading}>
          <Save className="h-4 w-4" />
          保存
        </Button>
        <span className="text-sm font-semibold">{message}</span>
      </div>
    </div>
  );
}
