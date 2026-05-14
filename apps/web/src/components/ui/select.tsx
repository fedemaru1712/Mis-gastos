import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-9.5 w-full rounded-2xl bg-secondary/70 px-3 py-2 text-base text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
