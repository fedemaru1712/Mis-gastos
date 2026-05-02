import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { InvestmentPosition } from "@personal-finance/shared";
import { MonthPickerField } from "@/components/forms/month-picker-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
const monthEntrySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  contribution: z.number().min(0),
  endOfMonthValue: z.number().min(0),
});

type MonthEntryValues = z.infer<typeof monthEntrySchema>;
import { formatCurrency, formatPercent } from "@/lib/format";

function nextMonth(month?: string) {
  const baseMonth = month ?? new Date().toISOString().slice(0, 7);
  const date = new Date(`${baseMonth}-01T00:00:00`);
  if (month) date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 7);
}

interface Props {
  open: boolean;
  investment?: InvestmentPosition | null;
  monthEntry?: InvestmentPosition["monthlyEntries"][number] | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MonthEntryValues) => Promise<void>;
}

export function InvestmentMonthDialog({ open, investment, monthEntry, onOpenChange, onSubmit }: Props) {
  const previousTotal =
    investment?.monthlyEntries
      .filter((entry) => entry.month !== monthEntry?.month)
      .filter((entry) => entry.month < (monthEntry?.month ?? "9999-99"))
      .reduce((sum, entry) => sum + entry.contribution, 0) ?? 0;

  const form = useForm<MonthEntryValues>({
    resolver: zodResolver(monthEntrySchema),
    defaultValues: {
      month: nextMonth(investment?.monthlyEntries.at(-1)?.month),
      contribution: investment?.monthlyEntries.at(-1)?.contribution ?? 150,
      endOfMonthValue: investment?.currentValue ?? investment?.totalContributed ?? 150,
    },
  });

  useEffect(() => {
    form.reset(
      monthEntry
        ? {
            month: monthEntry.month,
            contribution: monthEntry.contribution,
            endOfMonthValue: monthEntry.endOfMonthValue,
          }
        : {
            month: nextMonth(investment?.monthlyEntries.at(-1)?.month),
            contribution: investment?.monthlyEntries.at(-1)?.contribution ?? 150,
            endOfMonthValue: investment?.currentValue ?? investment?.totalContributed ?? 150,
          },
    );
  }, [form, investment, monthEntry]);

  const watchedMonth = useWatch({ control: form.control, name: "month" });
  const watchedContribution = useWatch({ control: form.control, name: "contribution" });
  const watchedEndOfMonthValue = useWatch({ control: form.control, name: "endOfMonthValue" });
  const contribution = Number(watchedContribution || 0);
  const endOfMonthValue = Number(watchedEndOfMonthValue || 0);
  const totalInvested = previousTotal + contribution;
  const result = endOfMonthValue - totalInvested;
  const percentage = totalInvested > 0 ? (result / totalInvested) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:w-[min(calc(100vw-2rem),36rem)]">
        <DialogHeader>
          <DialogTitle>{monthEntry ? "Editar mes" : "Añadir mes"}</DialogTitle>
          <DialogDescription>
            Registra la aportación del mes y el valor total de tu cartera al cierre para calcular la rentabilidad.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit(async (values) => onSubmit(values))}>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Mes</span>
              <MonthPickerField value={watchedMonth} onChange={(value) => form.setValue("month", value)} />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Aportación</span>
              <Input type="number" step="0.01" {...form.register("contribution", { valueAsNumber: true })} />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Valor al cierre</span>
              <Input type="number" step="0.01" {...form.register("endOfMonthValue", { valueAsNumber: true })} />
            </label>
          </div>
          <div className="rounded-xl border border-border/80 bg-secondary/40 p-4">
            <p className="text-sm font-semibold">Preview en tiempo real</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Total acumulado</p>
                <p className="mt-1 text-lg font-semibold">{formatCurrency(totalInvested)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Resultado</p>
                <p
                  className={
                    result >= 0
                      ? "mt-1 text-lg font-semibold text-emerald-400"
                      : "mt-1 text-lg font-semibold text-rose-400"
                  }
                >
                  {formatCurrency(result)}
                </p>
              </div>
            </div>
            <Badge
              className={result >= 0 ? "mt-3 bg-emerald-500/15 text-emerald-400" : "mt-3 bg-rose-500/15 text-rose-400"}
            >
              {percentage >= 0 ? "+" : ""}
              {formatPercent(percentage)}
            </Badge>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar mes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
