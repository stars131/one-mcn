import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BrandIcon } from "@/components/brand-icon";

export function AuthPageShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#faf6f1] px-5 py-8 text-stone-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <BrandIcon className="h-9 w-9" />
          小八的后援团
        </Link>
      </div>
      <section className="mx-auto grid min-h-[calc(100vh-90px)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[999px] border border-stone-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-stone-700 shadow-[0_12px_28px_rgba(120,96,62,0.12)]">
            <Sparkles className="h-4 w-4 text-olive-700" />
            邀请制内测
          </div>
          <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight tracking-tight">{title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-card/90 p-6 shadow-[0_18px_45px_rgba(120,96,62,0.12)]">
          {children}
        </div>
      </section>
    </main>
  );
}
