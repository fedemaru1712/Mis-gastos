import { cn } from "@/lib/utils";

interface Props {
  value: number;
  className?: string;
  indicatorClassName?: string;
  label?: string;
  labelClassName?: string;
  labelAlign?: "center" | "left";
}

export function Progress({ value, className, indicatorClassName, label, labelClassName, labelAlign = "center" }: Props) {
  const safeValue = Math.max(0, Math.min(value, 100));

  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary/90", className)}>
      <div
        className={cn("h-full rounded-full bg-primary transition-[width] duration-300 ease-out", indicatorClassName)}
        style={{ width: `${safeValue}%` }}
      />
      {label ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center px-2 text-xs font-medium text-foreground",
            labelAlign === "left" ? "justify-start pl-3 text-left" : "justify-center text-center",
            labelClassName,
          )}
        >
          <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{label}</span>
        </div>
      ) : null}
    </div>
  );
}
