import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";

export default function RegisterPage() {
  return (
    <AuthPageShell title="申请进入 One MCN。" subtitle="邀请码用于控制早期用户规模，确保每个创作者都能稳定体验完整工作流。">
      <h2 className="text-2xl font-semibold">创建账号</h2>
      <p className="mt-2 text-sm text-muted-foreground">填写邮箱和邀请码后即可进入工作台。</p>
      <div className="mt-6">
        <Suspense fallback={<div className="text-sm text-muted-foreground">加载中...</div>}>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </AuthPageShell>
  );
}
