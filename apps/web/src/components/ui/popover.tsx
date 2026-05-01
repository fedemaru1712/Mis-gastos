import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export function Popover(props: PopoverPrimitive.PopoverProps) {
  return <PopoverPrimitive.Root {...props} />;
}

export const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>((props, ref) => <PopoverPrimitive.Trigger ref={ref} {...props} />);

PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

export const PopoverAnchor = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Anchor>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>
>((props, ref) => <PopoverPrimitive.Anchor ref={ref} {...props} />);

PopoverAnchor.displayName = PopoverPrimitive.Anchor.displayName;

export function PopoverContent({ className, ...props }: PopoverPrimitive.PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={8}
        align="start"
        className={cn(
          "z-50 w-auto min-w-[18rem] rounded-xl border border-border bg-card p-0 text-card-foreground shadow-soft outline-none",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
