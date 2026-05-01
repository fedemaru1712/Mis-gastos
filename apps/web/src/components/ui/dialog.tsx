import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog(props: DialogPrimitive.DialogProps) {
  return <DialogPrimitive.Root {...props} />;
}

export const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>((props, ref) => <DialogPrimitive.Trigger ref={ref} {...props} />);

DialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

export const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>((props, ref) => <DialogPrimitive.Close ref={ref} {...props} />);

DialogClose.displayName = DialogPrimitive.Close.displayName;

export function DialogContent({ className, ...props }: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-1.5rem)] w-[min(calc(100vw-1rem),42rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-soft sm:max-h-[calc(100vh-3rem)] sm:w-[min(calc(100vw-2rem),42rem)] sm:p-6",
          className,
        )}
        {...props}
      >
        {props.children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col gap-1", className)} {...props} />
);

export const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
);

export const DialogDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);
