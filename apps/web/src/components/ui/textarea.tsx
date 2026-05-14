import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[112px] w-full rounded-xl bg-secondary/70 px-3 py-2 text-base outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
