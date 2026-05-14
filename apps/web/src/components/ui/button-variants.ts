import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-white/92",
        outline: "bg-secondary/70 text-foreground hover:bg-white/[0.05]",
        ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
        danger: "bg-danger/14 text-danger hover:bg-danger/18",
      },
      size: {
        default: "h-9.5 px-3.5 py-2 text-sm",
        sm: "h-8 px-3 text-[12px]",
        icon: "h-8.5 w-8.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
