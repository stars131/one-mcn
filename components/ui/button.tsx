import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost"; asChild?: boolean }) {
  const buttonClassName = cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition disabled:opacity-50",
    variant === "default" && "bg-primary text-primary-foreground hover:opacity-90",
    variant === "outline" && "border bg-card hover:bg-muted",
    variant === "ghost" && "hover:bg-muted",
    className
  );

  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children as React.ReactElement<{ className?: string }>, {
      className: cn(buttonClassName, props.children.props.className)
    });
  }

  return <button className={buttonClassName} {...props} />;
}
