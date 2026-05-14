import * as React from "react";
import { cn } from "@/lib/utils";

export const Table = ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto">
    <table className={cn("w-full text-left text-sm text-foreground", className)} {...props} />
  </div>
);

export const TableHeader = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...props} />;
export const TableBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />;
export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("last:border-b-0", className)} {...props} />
);
export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground", className)} {...props} />
);
export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-3 py-3 align-middle", className)} {...props} />
);
