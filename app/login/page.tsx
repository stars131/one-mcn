import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";

export default function LoginPage() {
  return (
    <AuthPageShell title="回到小八的后援团。" subtitle="你的专属MCN，已就位。使用邮箱和邀请码登录，继续处理热点、选题、内容和增长复盘。">
      <h2 className="text-2xl font-semibold">登录</h2>
      <p className="mt-2 text-sm text-muted-foreground">当前版本使用邀请制访问，后续可升级为邮箱验证码。</p>
      <div className="mt-6">
        <Suspense fallback={<div className="text-sm text-muted-foreground">加载中...</div>}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </AuthPageShell>
  );
}
