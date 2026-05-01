import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { expenseCategories, incomeCategories, transactionSchema, TransactionItem } from "@personal-finance/shared";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/forms/date-picker-field";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fetchBankAccounts } from "@/services/bank-accounts";
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
      description: "",
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const type = useWatch({ control: form.control, name: "type" });
  const selectedDate = useWatch({ control: form.control, name: "date" });
  const categories = type === "income" ? incomeCategories : expenseCategories;
  const bankAccountsQuery = useQuery({ queryKey: ["bank-accounts"], queryFn: fetchBankAccounts });

  useEffect(() => {
    form.reset(
      transaction
        ? {
            bankAccountId: transaction.bankAccountId ?? "",
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description ?? "",
            date: transaction.date.slice(0, 10),
          }
        : {
            bankAccountId: "",
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar movimiento" : "Nuevo movimiento"}</DialogTitle>
          <DialogDescription>Registra ingresos y gastos con validación compartida.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(async (values) => onSubmit(values))}>
          <Select className="sm:col-span-1" {...form.register("type")}>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </Select>
          <Input
            className="sm:col-span-1"
            type="number"
            step="0.01"
            placeholder="Cantidad"
            {...form.register("amount", { valueAsNumber: true })}
          />
          <Select className="sm:col-span-1" {...form.register("category")}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Select className="sm:col-span-1" {...form.register("bankAccountId")}>
            <option value="">Sin cuenta bancaria</option>
            {bankAccountsQuery.data?.items.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bankName} · {account.accountName}
              </option>
            ))}
          </Select>
          <DatePickerField
            className="sm:col-span-2"
            value={selectedDate}
            onChange={(value) => form.setValue("date", value)}
          />
          <Input className="sm:col-span-2" placeholder="Descripción opcional" {...form.register("description")} />
          <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
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
