import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Landmark, Plus } from "lucide-react";
import { BankAccount } from "@personal-finance/shared";
import { toast } from "sonner";
import { BankAccountFormDialog } from "@/components/forms/bank-account-form-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { createBankAccount, deleteBankAccount, fetchBankAccounts, updateBankAccount } from "@/services/bank-accounts";
import { BankAccountFormValues } from "@/types/api";

const money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

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
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajustes</CardTitle>
          <CardDescription>Información básica de tu cuenta autenticada con Google.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nombre</p>
              <p className="mt-2 font-semibold">{user?.name}</p>
            </div>
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</p>
              <p className="mt-2 font-semibold">{user?.email}</p>
            </div>
          </div>
          <Button variant="danger" onClick={() => void signOut()}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Cuentas bancarias</CardTitle>
            <CardDescription>Clasifica movimientos por banco o cuenta.</CardDescription>
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
            <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
              Aún no hay cuentas bancarias creadas.
            </div>
          )}
          {accountsQuery.data && accountsQuery.data.items.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {accountsQuery.data.items.map((account) => (
                <div key={account.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{account.bankName}</p>
                      <p className="text-sm text-muted-foreground">{account.accountName}</p>
                    </div>
                    <Landmark className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">Moneda: {account.currency}</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Saldo inicial: {money.format(account.openingBalance)}
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
