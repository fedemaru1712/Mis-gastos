import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { loanSchema, type Loan } from "@/domain";
import { DatePickerField } from "@/components/forms/date-picker-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { LoanFormValues } from "@/types/api";

interface Props {
  open: boolean;
  loan?: Loan | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LoanFormValues) => Promise<void>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-danger">{message}</p>;
}

export function LoanFormDialog({ open, loan, onOpenChange, onSubmit }: Props) {
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      name: "",
      initialAmount: 0,
      monthlyPayment: 0,
      paymentDay: 1,
      startDate: new Date().toISOString().slice(0, 10),
    },
  });

  const startDate = useWatch({ control: form.control, name: "startDate" });
  const initialAmount = Number(useWatch({ control: form.control, name: "initialAmount" }) || 0);
  const paymentDay = Number(useWatch({ control: form.control, name: "paymentDay" }) || 1);

  useEffect(() => {
    form.reset(
      loan
        ? {
            name: loan.name,
            initialAmount: loan.initialAmount,
            monthlyPayment: loan.monthlyPayment,
            paymentDay: loan.paymentDay,
            startDate: loan.startDate,
          }
        : {
            name: "",
            initialAmount: 0,
            monthlyPayment: 0,
            paymentDay: 1,
            startDate: new Date().toISOString().slice(0, 10),
          },
    );
  }, [form, loan]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:w-[min(calc(100vw-2rem),40rem)]">
        <DialogHeader>
          <DialogTitle>{loan ? "Editar préstamo" : "Nuevo préstamo"}</DialogTitle>
          <DialogDescription>
            Configura los datos base del préstamo. Los pagos mensuales se registran aparte y recalculan el progreso.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit(async (values) => onSubmit(values))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm sm:col-span-2">
              <span className="font-medium">Nombre del préstamo</span>
              <Input placeholder="Ej. Préstamo coche" {...form.register("name")} />
              <FieldError message={form.formState.errors.name?.message} />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Cantidad total</span>
              <Input type="number" step="0.01" {...form.register("initialAmount", { valueAsNumber: true })} />
              <FieldError message={form.formState.errors.initialAmount?.message} />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Cuota mensual habitual</span>
              <Input type="number" step="0.01" {...form.register("monthlyPayment", { valueAsNumber: true })} />
              <FieldError message={form.formState.errors.monthlyPayment?.message} />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Día de pago</span>
              <Input type="number" min="1" max="31" {...form.register("paymentDay", { valueAsNumber: true })} />
              <FieldError message={form.formState.errors.paymentDay?.message} />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Fecha de inicio</span>
              <DatePickerField value={startDate} onChange={(value) => form.setValue("startDate", value, { shouldValidate: true })} />
              <FieldError message={form.formState.errors.startDate?.message} />
            </label>
          </div>
          <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 text-sm">
            <p className="text-muted-foreground">Resumen inicial</p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <p>
                Total: <span className="font-semibold">{formatCurrency(initialAmount)}</span>
              </p>
              <p>
                Pendiente inicial: <span className="font-semibold">{formatCurrency(initialAmount)}</span>
              </p>
              <p>
                Día habitual: <span className="font-semibold">{paymentDay}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar préstamo</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
