import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost"; asChild?: boolean }) {
  const buttonClassName = cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-none border-2 border-black px-3 text-sm font-bold transition disabled:opacity-50",
    variant === "default" && "bg-[#ff2d55] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5",
    variant === "outline" && "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#fff200]",
    variant === "ghost" && "border-transparent shadow-none hover:border-black hover:bg-[#fff200]",
    className
  );

  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children as React.ReactElement<{ className?: string }>, {
      className: cn(buttonClassName, props.children.props.className)
    });
  }

  return <button className={buttonClassName} {...props} />;
}
