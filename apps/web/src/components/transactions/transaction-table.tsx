import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TransactionItem } from "@personal-finance/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchBankAccounts } from "@/services/bank-accounts";
import { fetchTransactions } from "@/services/transactions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

interface Props {
  items: TransactionItem[];
  onEdit: (transaction: TransactionItem) => void;
  onDelete: (transaction: TransactionItem) => void;
}

export function TransactionTable({ items, onEdit, onDelete }: Props) {
  const bankAccountsQuery = useQuery({ queryKey: ["bank-accounts"], queryFn: fetchBankAccounts });
  const allTransactionsQuery = useQuery({
    queryKey: ["transactions", "all-balances"],
    queryFn: () => fetchTransactions({}),
  });
  const bankNames = useMemo(
    () => new Map(bankAccountsQuery.data?.items.map((account) => [account.id, account.bankName]) ?? []),
    [bankAccountsQuery.data?.items],
  );
  const runningBalances = useMemo(() => {
    const openingBalances = new Map(
      bankAccountsQuery.data?.items.map((account) => [account.id, account.openingBalance]) ?? [],
    );
    const orderedTransactions = [...(allTransactionsQuery.data?.items ?? [])].sort((left, right) => {
      const byDate = new Date(left.date).getTime() - new Date(right.date).getTime();
      if (byDate !== 0) return byDate;

      const byCreatedAt = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      if (byCreatedAt !== 0) return byCreatedAt;

      return left.id.localeCompare(right.id);
    });

    const balances = new Map<string, number>();
    const results = new Map<string, number>();

    for (const transaction of orderedTransactions) {
      if (!transaction.bankAccountId) continue;

      const currentBalance =
        balances.get(transaction.bankAccountId) ?? openingBalances.get(transaction.bankAccountId) ?? 0;
      const nextBalance =
        transaction.type === "income" ? currentBalance + transaction.amount : currentBalance - transaction.amount;

      balances.set(transaction.bankAccountId, nextBalance);
      results.set(transaction.id, nextBalance);
    }

    return results;
  }, [allTransactionsQuery.data?.items, bankAccountsQuery.data?.items]);

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-secondary/40 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{item.category}</p>
                <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("es-ES")}</p>
                {item.bankAccountId && (
                  <p className="text-xs text-muted-foreground">
                    {bankNames.get(item.bankAccountId) ?? "Cuenta vinculada"}
                  </p>
                )}
              </div>
              <Badge variant={item.type}>{item.type === "income" ? "Ingreso" : "Gasto"}</Badge>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Cantidad</p>
                <p className="mt-1 font-semibold">{formatCurrency(item.amount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo cuenta</p>
                <p className="mt-1 truncate">
                  {item.bankAccountId ? formatCurrency(runningBalances.get(item.id) ?? 0) : "-"}
                </p>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">{item.description || "Sin descripción"}</p>
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-danger flex" onClick={() => onDelete(item)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Saldo cuenta</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.date).toLocaleDateString("es-ES")}</TableCell>
                <TableCell>
                  <Badge variant={item.type}>{item.type === "income" ? "Ingreso" : "Gasto"}</Badge>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  {item.bankAccountId ? (bankNames.get(item.bankAccountId) ?? "Cuenta vinculada") : "-"}
                </TableCell>
                <TableCell>{item.description || "Sin descripción"}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                <TableCell>{item.bankAccountId ? formatCurrency(runningBalances.get(item.id) ?? 0) : "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)} className="flex">
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-danger flex" onClick={() => onDelete(item)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
