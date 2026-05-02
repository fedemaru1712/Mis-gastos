import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { bankAccountSchema, BankAccount } from "@personal-finance/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BankAccountFormValues } from "@/types/api";

interface Props {
  open: boolean;
  account?: BankAccount | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BankAccountFormValues) => Promise<void>;
}

export function BankAccountFormDialog({ open, account, onOpenChange, onSubmit }: Props) {
  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: { bankName: "", accountName: "", openingBalance: 0, currency: "EUR" },
  });

  useEffect(() => {
    form.reset(
      account
        ? {
            bankName: account.bankName,
            accountName: account.accountName,
            openingBalance: account.openingBalance,
            currency: account.currency,
          }
        : { bankName: "", accountName: "", openingBalance: 0, currency: "EUR" },
    );
  }, [account, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? "Editar cuenta" : "Nueva cuenta bancaria"}</DialogTitle>
          <DialogDescription>Asocia movimientos a cada banco o cuenta del usuario.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit(async (values) => onSubmit(values))}>
          <Input placeholder="Banco" {...form.register("bankName")} />
          <Input placeholder="Nombre de la cuenta" {...form.register("accountName")} />
          <Input
            type="number"
            step="0.01"
            placeholder="Saldo inicial"
            {...form.register("openingBalance", { valueAsNumber: true })}
          />
          <Input placeholder="Moneda" maxLength={3} {...form.register("currency")} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
