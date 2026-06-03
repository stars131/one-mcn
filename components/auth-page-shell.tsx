import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthPageShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f4ed] px-5 py-8 text-[#1d1b18]">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4a3828] text-white">助</span>
          小八的后援团
        </Link>
      </div>
      <section className="mx-auto grid min-h-[calc(100vh-90px)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            邀请制内测
          </div>
          <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight tracking-tight">{title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-[2rem] border bg-white/80 p-6 shadow-2xl shadow-[#4a3828]/10 backdrop-blur">
          {children}
        </div>
      </section>
    </main>
  );
}
