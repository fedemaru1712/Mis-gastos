import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-base outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
