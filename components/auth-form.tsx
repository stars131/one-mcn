"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (isRegister && password !== confirmPassword) {
        throw new Error("两次输入的密码不一致");
      }
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword: isRegister ? confirmPassword : undefined, name: isRegister ? name : undefined, inviteCode: isRegister ? inviteCode : undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "操作失败");
      router.push(searchParams.get("redirect") || "/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {isRegister ? (
        <label className="block space-y-2 text-sm">
          <span className="text-muted-foreground">你的名字</span>
          <Input name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：周同学" />
        </label>
      ) : null}
      <label className="block space-y-2 text-sm">
        <span className="text-muted-foreground">邮箱</span>
        <Input required name="email" autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="text-muted-foreground">密码</span>
        <Input required name="password" autoComplete={isRegister ? "new-password" : "current-password"} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? "至少 8 位" : "请输入密码"} />
      </label>
      {isRegister ? (
        <label className="block space-y-2 text-sm">
          <span className="text-muted-foreground">确认密码</span>
          <Input required name="confirmPassword" autoComplete="new-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="再次输入密码" />
        </label>
      ) : null}
      {isRegister ? (
        <label className="block space-y-2 text-sm">
          <span className="text-muted-foreground">邀请码</span>
          <Input required name="inviteCode" autoComplete="one-time-code" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="请输入邀请码" />
        </label>
      ) : null}
      <Button className="h-11 w-full" disabled={loading}>
        {loading ? "处理中..." : isRegister ? "创建账号" : "登录工作台"}
        <ArrowRight className="h-4 w-4" />
      </Button>
      {message ? <p className="border-2 border-black bg-[#ffb3c1] p-3 text-sm font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{message}</p> : null}
      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? "已有账号？" : "还没有账号？"}
        <Link className="ml-1 font-medium text-primary" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "去登录" : "申请注册"}
        </Link>
      </p>
    </form>
  );
}
