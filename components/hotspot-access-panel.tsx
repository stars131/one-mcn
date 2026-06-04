"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Radar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type HotspotAccess = { credits: number; paidDailyCost: number; freeEnabled: boolean; paidEnabled: boolean };

export function HotspotAccessPanel() {
  const [data, setData] = useState<HotspotAccess | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/hotspot-access");
    setData(await res.json());
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);

  async function run(path: string, success: string) {
    setMessage("");
    const res = await fetch(path, { method: "POST" });
    if (!res.ok) {
      setMessage((await res.json()).error || "操作失败");
      return;
    }
    setMessage(success);
    await load();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5" />
          <CardTitle>免费热点接口</CardTitle>
        </div>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">用于日常试用和基础热点采集，不展示接口地址。</p>
        <Button className="mt-4" onClick={() => run("/api/hotspot-access/free", "免费热点接口已启用")}>
          {data?.freeEnabled ? "重新启用" : "启用免费接口"}
        </Button>
      </Card>
      <Card>
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-5 w-5" />
          <CardTitle>付费热点接口</CardTitle>
        </div>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">花费积分获取一天的付费热点信息接口，接口地址由管理员维护。</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-[999px] border border-stone-200 bg-amber-100 px-3 py-2 text-sm font-black text-stone-800 shadow-[0_12px_28px_rgba(120,96,62,0.10)]">
            <Zap className="mr-1 inline h-4 w-4" />
            {data?.paidDailyCost ?? 0} 积分/天
          </span>
          <span className="text-sm font-semibold">余额 {data?.credits ?? 0}</span>
        </div>
        <Button className="mt-4" onClick={() => run("/api/hotspot-access/paid", "已购买今日付费热点接口")}>
          {data?.paidEnabled ? "再次购买" : "购买今日接口"}
        </Button>
      </Card>
      {message ? <p className="rounded-[1.5rem] border border-stone-200 bg-amber-50 p-3 text-sm font-semibold lg:col-span-2">{message}</p> : null}
    </div>
  );
}
