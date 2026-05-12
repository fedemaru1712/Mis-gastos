import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { expenseCategories, incomeCategories, transactionSchema, TransactionItem } from "@/domain";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/forms/date-picker-field";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fetchBankAccounts } from "@/services/bank-accounts";
import { fetchLoans } from "@/services/loans";
import { TransactionFormValues } from "@/types/api";

interface Props {
  open: boolean;
  transaction?: TransactionItem | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
}

export function TransactionFormDialog({ open, transaction, onOpenChange, onSubmit }: Props) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      category: expenseCategories[0],
      loanId: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const type = useWatch({ control: form.control, name: "type" });
  const category = useWatch({ control: form.control, name: "category" });
  const loanId = useWatch({ control: form.control, name: "loanId" });
  const selectedDate = useWatch({ control: form.control, name: "date" });
  const categories = type === "income" ? incomeCategories : expenseCategories;
  const bankAccountsQuery = useQuery({ queryKey: ["bank-accounts"], queryFn: fetchBankAccounts });
  const loansQuery = useQuery({ queryKey: ["loans"], queryFn: fetchLoans });
  const activeLoans = (loansQuery.data?.items ?? []).filter((loan) => loan.status === "active");
  const showLoanRepaymentOption = type === "expense" && category === "Préstamos";
  const repaymentEnabled = showLoanRepaymentOption && Boolean(loanId);

  useEffect(() => {
    if (!showLoanRepaymentOption && loanId) {
      form.setValue("loanId", "", { shouldValidate: true });
    }
  }, [form, loanId, showLoanRepaymentOption]);

  useEffect(() => {
    form.reset(
      transaction
        ? {
            bankAccountId: transaction.bankAccountId ?? "",
            loanId: transaction.loanId ?? "",
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description ?? "",
            date: transaction.date.slice(0, 10),
          }
        : {
            bankAccountId: "",
            loanId: "",
            type: "expense",
            amount: 0,
            category: expenseCategories[0],
            description: "",
            date: new Date().toISOString().slice(0, 10),
          },
    );
  }, [form, transaction]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-full max-sm:max-h-[calc(100dvh-24px)]">
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar movimiento" : "Nuevo movimiento"}</DialogTitle>
          <DialogDescription>Registra ingresos y gastos con validación compartida.</DialogDescription>
        </DialogHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(async (values) => onSubmit(values))}>
          <div className="grid min-h-0 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
            <Select className="min-w-0 sm:col-span-1" {...form.register("type")}>
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </Select>
            <Input
              className="min-w-0 sm:col-span-1"
              type="number"
              step="0.01"
              placeholder="Cantidad"
              {...form.register("amount", { valueAsNumber: true })}
            />
            <Select className="min-w-0 sm:col-span-1" {...form.register("category")}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Select className="min-w-0 sm:col-span-1" {...form.register("bankAccountId")}>
              <option value="">Sin cuenta bancaria</option>
              {bankAccountsQuery.data?.items.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} · {account.accountName}
                </option>
              ))}
            </Select>
            {showLoanRepaymentOption && (
              <div className="min-w-0 sm:col-span-2 rounded-xl border border-border/80 bg-secondary/20 p-4">
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border bg-background"
                    checked={repaymentEnabled}
                    disabled={activeLoans.length === 0}
                    onChange={(event) => form.setValue("loanId", event.target.checked ? activeLoans[0]?.id ?? "" : "")}
                  />
                  <span className="min-w-0">Este gasto es una devolución de préstamo</span>
                </label>
                {activeLoans.length === 0 && <p className="mt-3 text-xs text-muted-foreground">No hay préstamos activos disponibles.</p>}
                {repaymentEnabled && (
                  <div className="mt-3 grid gap-2">
                    <Select className="min-w-0" value={loanId} onChange={(event) => form.setValue("loanId", event.target.value, { shouldValidate: true })}>
                      <option value="">Selecciona un préstamo</option>
                      {activeLoans.map((loan) => (
                        <option key={loan.id} value={loan.id}>
                          {loan.name}
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Al guardar este gasto, se registrará automáticamente el pago mensual del préstamo seleccionado.
                    </p>
                    {form.formState.errors.loanId?.message && <p className="text-xs text-danger">{form.formState.errors.loanId.message}</p>}
                  </div>
                )}
              </div>
            )}
            <DatePickerField
              className="sm:col-span-2"
              value={selectedDate}
              onChange={(value) => form.setValue("date", value)}
            />
            <Input className="min-w-0 sm:col-span-2" placeholder="Descripción opcional" {...form.register("description")} />
          </div>
          <div className="mt-4 flex shrink-0 flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="w-full sm:w-auto" type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
