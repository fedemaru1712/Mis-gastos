import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Landmark, Plus } from "lucide-react";
import { BankAccount } from "@/domain";
import { toast } from "sonner";
import { BankAccountFormDialog } from "@/components/forms/bank-account-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/format";
import { createBankAccount, deleteBankAccount, fetchBankAccounts, updateBankAccount } from "@/services/bank-accounts";
import { BankAccountFormValues } from "@/types/api";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BankAccount | null>(null);
  const accountsQuery = useQuery({ queryKey: ["bank-accounts"], queryFn: fetchBankAccounts });
  const mutation = useMutation({
    mutationFn: async (values: BankAccountFormValues) =>
      selected ? updateBankAccount(selected.id, values) : createBankAccount(values),
    onSuccess: () => {
      toast.success(selected ? "Cuenta actualizada" : "Cuenta creada");
      setOpen(false);
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBankAccount(id),
    onSuccess: () => {
      toast.success("Cuenta eliminada");
      void queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <section className="space-y-4">
      <div className="hidden lg:block">
        <h2 className="mt-1.5 text-[28px] font-semibold tracking-tight">Ajustes y cuentas</h2>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Ajustes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-secondary/55 p-3.5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nombre</p>
              <p className="mt-2 font-semibold">{user?.name}</p>
            </div>
            <div className="rounded-2xl bg-secondary/55 p-3.5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
              <p className="mt-2 font-semibold">{user?.email}</p>
            </div>
          </div>
          <Button variant="danger" onClick={() => void signOut()}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Cuentas bancarias</CardTitle>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Nueva cuenta
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountsQuery.isPending && <p className="text-sm text-muted-foreground">Cargando cuentas...</p>}
          {accountsQuery.isError && <p className="text-sm text-danger">{accountsQuery.error.message}</p>}
          {accountsQuery.data && accountsQuery.data.items.length === 0 && (
            <div className="rounded-3xl bg-secondary/45 p-4 text-sm text-muted-foreground">
              Aún no hay cuentas bancarias creadas.
            </div>
          )}
          {accountsQuery.data && accountsQuery.data.items.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {accountsQuery.data.items.map((account) => (
                <div key={account.id} className="rounded-[18px] bg-secondary/40 p-3.5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{account.bankName}</p>
                      <p className="text-sm text-muted-foreground">{account.accountName}</p>
                    </div>
                    <Landmark className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">Moneda: {account.currency}</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Saldo inicial: {formatCurrency(account.openingBalance)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelected(account);
                        setOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={() => deleteMutation.mutate(account.id)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <BankAccountFormDialog
        open={open}
        account={selected}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSelected(null);
        }}
        onSubmit={async (values) => {
          await mutation.mutateAsync(values);
        }}
      />
    </section>
  );
}
