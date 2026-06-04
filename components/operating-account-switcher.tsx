"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { defaultPlatform, platformLabels } from "@/lib/platforms/registry";

type OperatingAccount = {
  id: string;
  name: string;
  platform?: string | null;
  handle?: string | null;
  description?: string | null;
};

export function OperatingAccountSwitcher({ accounts, currentId }: { accounts: OperatingAccount[]; currentId: string }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(currentId);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function switchAccount(accountId: string) {
    setSelectedId(accountId);
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/operating-accounts/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId })
      });
      if (!res.ok) throw new Error((await res.json()).error || "切换失败");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "切换失败");
    } finally {
      setLoading(false);
    }
  }

  async function createAccount() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setMessage("");
    try {
      const createRes = await fetch("/api/operating-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, platform: platform.trim() || defaultPlatform })
      });
      if (!createRes.ok) throw new Error((await createRes.json()).error || "创建失败");
      const account = await createRes.json();
      setName("");
      setPlatform("");
      await switchAccount(account.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建失败");
      setLoading(false);
    }
  }

  const current = accounts.find((account) => account.id === selectedId) || accounts[0];

  return (
    <div className="rounded-[2rem] border border-stone-200 bg-card/90 p-4 shadow-[0_16px_36px_rgba(120,96,62,0.10)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[38%_62%_44%_56%/52%_38%_62%_48%] border border-olive-700/20 bg-amber-100 text-olive-800">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">当前运营账号</p>
            <p className="font-semibold">{current?.name || "默认运营账号"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-10 rounded-[1.25rem] border border-stone-300 bg-amber-50/70 px-3 text-sm" value={selectedId} disabled={loading} onChange={(event) => switchAccount(event.target.value)}>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.platform ? `${account.name} · ${account.platform}` : account.name}
              </option>
            ))}
          </select>
          <Button variant="outline" disabled={loading} onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_160px_auto]">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="新增运营账号名称" />
        <Select value={platform || defaultPlatform} onChange={(event) => setPlatform(event.target.value)}>
          {platformLabels.map((item) => <option key={item}>{item}</option>)}
        </Select>
        <Button disabled={loading || !name.trim()} onClick={createAccount}>
          <Plus className="h-4 w-4" />
          新增并切换
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-red-700">{message}</p> : null}
    </div>
  );
}
