import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { investmentSchema, InvestmentPosition } from "@personal-finance/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InvestmentFormValues } from "@/types/api";

interface Props {
  open: boolean;
  investment?: InvestmentPosition | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InvestmentFormValues) => Promise<void>;
}

export function InvestmentFormDialog({ open, investment, onOpenChange, onSubmit }: Props) {
  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentSchema),
    defaultValues: { name: "", type: "other", symbol: "", platform: "", monthlyEntries: [] },
  });

  useEffect(() => {
    form.reset(
      investment
        ? {
            name: investment.name,
            type: investment.type,
            symbol: investment.symbol ?? "",
            platform: investment.platform ?? "",
            monthlyEntries: investment.monthlyEntries.map((entry) => ({
              month: entry.month,
              contribution: entry.contribution,
              endOfMonthValue: entry.endOfMonthValue,
            })),
          }
        : { name: "", type: "other", symbol: "", platform: "", monthlyEntries: [] },
    );
  }, [form, investment]);

  const existingMonthlyEntries =
    investment?.monthlyEntries.map((entry) => ({
      month: entry.month,
      contribution: entry.contribution,
      endOfMonthValue: entry.endOfMonthValue,
    })) ?? [];

  async function submitPlan(values: InvestmentFormValues) {
    await onSubmit({
      name: values.name,
      platform: values.platform ?? "",
      type: investment?.type ?? "other",
      symbol: investment?.symbol ?? "",
      monthlyEntries: existingMonthlyEntries,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:w-[min(calc(100vw-2rem),34rem)]">
        <DialogHeader>
          <DialogTitle>{investment ? "Editar plan de inversión" : "Nuevo plan de inversión"}</DialogTitle>
          <DialogDescription>
            Crea el plan primero. Los cierres mensuales se registran después, mes a mes, desde la tabla de seguimiento.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit(submitPlan)}>
          <div className="rounded-xl border border-border/80 bg-card/70 p-4">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="font-medium">Nombre del plan</span>
                <Input placeholder="Ej. Plan ETF mensual" {...form.register("name")} />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium">Broker o plataforma</span>
                <Input placeholder="Ej. Trade Republic" {...form.register("platform")} />
              </label>
            </div>
          </div>
          <div className="rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">
            Guardas el plan ahora y luego podrás añadir meses con su aportación y el valor de cierre desde el registro
            mensual.
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar plan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
