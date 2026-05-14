import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { calculateLoanMetrics, loanPaymentSchema, type Loan, type LoanPayment } from "@/domain";
import { MonthPickerField } from "@/components/forms/month-picker-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPercent } from "@/lib/format";
import { LoanPaymentFormValues } from "@/types/api";

interface Props {
  open: boolean;
  loan?: Loan | null;
  payment?: LoanPayment | null;
  existingPayments: LoanPayment[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LoanPaymentFormValues) => Promise<void>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-danger">{message}</p>;
}

export function LoanPaymentDialog({ open, loan, payment, existingPayments, onOpenChange, onSubmit }: Props) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const form = useForm<LoanPaymentFormValues>({
    resolver: zodResolver(loanPaymentSchema),
    defaultValues: {
      amount: payment?.amount ?? loan?.monthlyPayment ?? 0,
      paymentMonth: payment?.paymentMonth ?? currentMonth,
    },
  });

  const watchedAmount = Number(useWatch({ control: form.control, name: "amount" }) || 0);
  const watchedPaymentMonth = useWatch({ control: form.control, name: "paymentMonth" });

  useEffect(() => {
    form.reset({
      amount: payment?.amount ?? loan?.monthlyPayment ?? 0,
      paymentMonth: payment?.paymentMonth ?? currentMonth,
    });
  }, [currentMonth, existingPayments, form, loan, payment]);

  const projection = loan
    ? calculateLoanMetrics({
        initialAmount: loan.initialAmount,
        payments: [
          ...existingPayments.filter((item) => item.id !== payment?.id),
          { amount: watchedAmount },
        ],
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:w-[min(calc(100vw-2rem),38rem)]">
        <DialogHeader>
          <DialogTitle>{payment ? "Editar pago" : "Registrar pago"}</DialogTitle>
          <DialogDescription>
            Usa la cuota configurada como punto de partida, pero ajusta el importe real antes de guardar si lo necesitas.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit(async (values) => onSubmit(values))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Cantidad pagada</span>
              <Input type="number" step="0.01" {...form.register("amount", { valueAsNumber: true })} />
              <FieldError message={form.formState.errors.amount?.message} />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Mes del pago</span>
              <MonthPickerField value={watchedPaymentMonth} onChange={(value) => form.setValue("paymentMonth", value, { shouldValidate: true })} />
              <FieldError message={form.formState.errors.paymentMonth?.message} />
            </label>
          </div>
          {loan && projection && (
            <div className="rounded-xl bg-secondary/30 p-4 text-sm">
              <p className="font-semibold">Impacto estimado</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total pagado</p>
                  <p className="mt-1 font-semibold">{formatCurrency(projection.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pendiente</p>
                  <p className="mt-1 font-semibold">{formatCurrency(projection.remainingAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amortizado</p>
                  <p className="mt-1 font-semibold">{formatPercent(projection.progressPercentage)}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar pago</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
