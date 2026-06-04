import { cn } from "@/lib/utils";

export function BrandIcon({ className }: { className?: string }) {
  return (
    <span
      aria-label="WLWL"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-[38%_62%_44%_56%/52%_38%_62%_48%] border border-olive-700/20 bg-amber-100 text-[10px] font-black text-olive-800 shadow-[0_10px_24px_rgba(120,96,62,0.14)]",
        className
      )}
    >
      WLWL
    </span>
  );
}
