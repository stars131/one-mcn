import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-none border-2 border-black bg-card p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:border-4 md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold", className)} {...props} />;
}
