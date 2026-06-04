import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("h-10 w-full rounded-[1.25rem] border border-stone-300 bg-amber-50/70 px-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-ring", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("min-h-28 w-full rounded-[1.5rem] border border-stone-300 bg-amber-50/70 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-ring", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("h-10 w-full rounded-[1.25rem] border border-stone-300 bg-amber-50/70 px-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-ring", props.className)} />;
}
