"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="ghost" className="px-3 text-muted-foreground" onClick={logout}>
      <LogOut className="h-4 w-4" />
      退出登录
    </Button>
  );
}
