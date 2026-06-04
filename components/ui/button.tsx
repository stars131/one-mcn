import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost"; asChild?: boolean }) {
  const buttonClassName = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-[999px] border px-4 text-sm font-semibold transition disabled:opacity-50",
    variant === "default" && "border-olive-700/20 bg-olive-700 text-amber-50 shadow-[0_10px_24px_rgba(78,93,46,0.18)] hover:-translate-y-0.5 hover:bg-olive-800",
    variant === "outline" && "border-stone-300 bg-amber-50/80 text-stone-800 shadow-[0_10px_24px_rgba(120,96,62,0.10)] hover:bg-amber-100",
    variant === "ghost" && "border-transparent shadow-none hover:bg-amber-100 text-stone-700",
    className
  );

  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children as React.ReactElement<{ className?: string }>, {
      className: cn(buttonClassName, props.children.props.className)
    });
  }

  return <button className={buttonClassName} {...props} />;
}
