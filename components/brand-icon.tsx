import { cn } from "@/lib/utils";

export function BrandIcon({ className }: { className?: string }) {
  return (
    <span
      aria-label="WLWL"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-none border-2 border-black bg-[#fff200] text-[10px] font-black tracking-[-0.04em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        className
      )}
    >
      WLWL
    </span>
  );
}
