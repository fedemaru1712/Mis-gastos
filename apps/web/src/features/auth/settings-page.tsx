import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Landmark, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
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

  const initials = user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <section className="space-y-4">
      <div className="hidden lg:block">
        <h2 className="mt-1.5 text-[28px] font-semibold tracking-tight">Ajustes</h2>
      </div>

      {/* Profile card */}
      <Card className="bg-card">
        <CardContent className="p-0">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-lg font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{user?.name ?? "—"}</p>
              <p className="truncate text-sm text-muted-foreground">{user?.email ?? "—"}</p>
            </div>
          </div>

          {/* Sign out row */}
          <div className="border-t border-white/[0.05]">
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex w-full items-center justify-between px-5 py-3.5 text-sm text-rose-400 transition-colors hover:text-rose-300"
            >
              <span className="flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </span>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Bank accounts card */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Cuentas bancarias</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nueva
          </Button>
        </CardHeader>
        <CardContent>
          {accountsQuery.isPending && (
            <p className="text-sm text-muted-foreground">Cargando cuentas...</p>
          )}
          {accountsQuery.isError && (
            <p className="text-sm text-danger">{accountsQuery.error.message}</p>
          )}
          {accountsQuery.data && accountsQuery.data.items.length === 0 && (
            <div className="rounded-2xl bg-white/[0.04] p-6 text-center text-sm text-muted-foreground">
              Aún no hay cuentas bancarias creadas.
            </div>
          )}
          {accountsQuery.data && accountsQuery.data.items.length > 0 && (
            <div className="divide-y divide-white/[0.05]">
              {accountsQuery.data.items.map((account) => (
                <div key={account.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{account.bankName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {account.accountName} · {account.currency} · Saldo inicial{" "}
                      {formatCurrency(account.openingBalance)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelected(account);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger"
                      onClick={() => deleteMutation.mutate(account.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
