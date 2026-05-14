import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium", {
  variants: {
    variant: {
      default: "bg-white/[0.04] text-secondary-foreground",
      income: "bg-emerald-400/8 text-emerald-300",
      expense: "bg-rose-400/8 text-rose-300",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({
  className,
  variant,
  children,
}: React.PropsWithChildren<VariantProps<typeof badgeVariants> & { className?: string }>) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}
