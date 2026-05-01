import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TransactionItem } from "@personal-finance/shared";
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Historial de movimientos</CardTitle>
            <CardDescription>Filtra, crea, edita y elimina tus ingresos y gastos.</CardDescription>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo movimiento
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransactionFilters filters={filters} onChange={setFilters} />
          {query.isPending && <p className="text-sm text-muted-foreground">Cargando movimientos...</p>}
          {query.isError && <p className="text-sm text-danger">{query.error.message}</p>}
          {query.data && query.data.items.length === 0 && (
            <div className="rounded-2xl bg-secondary p-6 text-sm text-muted-foreground">
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
