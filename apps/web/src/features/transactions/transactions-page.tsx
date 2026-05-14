import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { TransactionItem } from "@/domain";
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { createTransaction, deleteTransaction, fetchTransactions, updateTransaction } from "@/services/transactions";
import { TransactionFormValues, TransactionQuery } from "@/types/api";

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TransactionQuery>({
    type: "all",
    month: new Date().toISOString().slice(0, 7),
  });
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TransactionItem | null>(null);

  const query = useQuery({ queryKey: ["transactions", filters], queryFn: () => fetchTransactions(filters) });
  const mutation = useMutation({
    mutationFn: async (values: TransactionFormValues) => {
      if (selected) return updateTransaction(selected.id, values);
      return createTransaction(values);
    },
    onSuccess: () => {
      toast.success(selected ? "Movimiento actualizado" : "Movimiento creado");
      setOpen(false);
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (item: TransactionItem) => deleteTransaction(item.id),
    onSuccess: () => {
      toast.success("Movimiento eliminado");
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const items = query.data?.items ?? [];
  const expenseTotal = items.reduce((sum, item) => sum + (item.type === "expense" ? item.amount : 0), 0);
  const incomeTotal = items.reduce((sum, item) => sum + (item.type === "income" ? item.amount : 0), 0);
  const netTotal = incomeTotal - expenseTotal;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="hidden lg:block">
          <h2 className="mt-1.5 text-[28px] font-semibold tracking-tight">Movimientos</h2>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo movimiento
        </Button>
      </div>

      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Flujo del periodo</p>
              <p className="mt-2 text-[34px] font-semibold tracking-tight sm:text-[40px]">{formatCurrency(netTotal)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/8 px-2.5 py-1 text-emerald-300">
                  <ArrowUpRight className="h-4 w-4" />
                  Ingresos {formatCurrency(incomeTotal)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/8 px-2.5 py-1 text-rose-300">
                  <ArrowDownRight className="h-4 w-4" />
                  Gastos {formatCurrency(expenseTotal)}
                </span>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl bg-secondary/60 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Registros</p>
                <p className="mt-1.5 text-xl font-semibold">{items.length}</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Pantalla gasto</p>
                <p className="mt-1.5 text-sm font-semibold">{filters.type === "expense" ? "Activa" : "Filtrable"}</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Pantalla ingreso</p>
                <p className="mt-1.5 text-sm font-semibold">{filters.type === "income" ? "Activa" : "Filtrable"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Actividad financiera</CardTitle>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-full bg-secondary/75 p-0.5">
            <Button
              variant={filters.type === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilters((current) => ({ ...current, type: "all", category: "all" }))}
            >
              Todo
            </Button>
            <Button
              variant={filters.type === "expense" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilters((current) => ({ ...current, type: "expense", category: "all" }))}
            >
              Gastos
            </Button>
            <Button
              variant={filters.type === "income" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilters((current) => ({ ...current, type: "income", category: "all" }))}
            >
              Ingresos
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransactionFilters filters={filters} onChange={setFilters} />
          {query.isPending && <p className="text-sm text-muted-foreground">Cargando movimientos...</p>}
          {query.isError && <p className="text-sm text-danger">{query.error.message}</p>}
          {query.data && query.data.items.length === 0 && (
            <div className="rounded-3xl bg-secondary/50 p-6 text-sm text-muted-foreground">
              No hay movimientos para estos filtros.
            </div>
          )}
          {query.data && query.data.items.length > 0 && (
            <TransactionTable
              items={query.data.items}
              onEdit={(item) => {
                setSelected(item);
                setOpen(true);
              }}
              onDelete={(item) => deleteMutation.mutate(item)}
            />
          )}
        </CardContent>
      </Card>
      <TransactionFormDialog
        open={open}
        transaction={selected}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setSelected(null);
        }}
        onSubmit={async (values) => {
          await mutation.mutateAsync(values);
        }}
      />
    </section>
  );
}
