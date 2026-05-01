import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-secondary text-secondary-foreground",
      income: "bg-emerald-100 text-emerald-700",
      expense: "bg-rose-100 text-rose-700",
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
