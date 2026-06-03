import { cn } from "@/lib/utils";

export function BrandIcon({ className }: { className?: string }) {
  return (
    <span
      aria-label="WLWL"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-[10px] font-semibold tracking-[-0.08em] text-white shadow-sm shadow-black/10",
        className
      )}
    >
      WLWL
    </span>
  );
}
