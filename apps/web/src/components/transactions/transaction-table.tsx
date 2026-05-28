import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TransactionItem } from "@/domain";
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
import { getCategoryTone } from "@/lib/category-colors";
import { formatCurrency } from "@/lib/format";

interface Props {
  items: TransactionItem[];
  onEdit: (transaction: TransactionItem) => void;
  onDelete: (transaction: TransactionItem) => void;
}

function formatDate(dateString: string) {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
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
      {/* Mobile list */}
      <div className="divide-y divide-white/[0.05] md:hidden">
        {items.map((item) => {
          const tone = getCategoryTone(item.category);
          return (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${tone.dot}22` }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tone.dot }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: tone.text }}>
                  {item.category}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.description || "Sin descripción"}
                  {item.loanId && " · Préstamo"}
                  {" · "}
                  {formatDate(item.date)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <p
                  className={`text-sm font-semibold tabular-nums ${
                    item.type === "income" ? "text-emerald-400" : "text-foreground"
                  }`}
                >
                  {item.type === "income" ? "+" : "-"}
                  {formatCurrency(item.amount)}
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-3.5 w-3.5" />
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
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table className="overflow-hidden rounded-2xl bg-white/[0.03]">
          <TableHeader>
            <TableRow className="bg-white/[0.04] hover:bg-white/[0.04]">
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Saldo cuenta</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const tone = getCategoryTone(item.category);
              return (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{formatDate(item.date)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: tone.dot }} />
                      <span style={{ color: tone.text }}>{item.category}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.description || "—"}
                    {item.loanId && <span className="ml-1 text-xs text-white/40">· Préstamo</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.bankAccountId ? (bankNames.get(item.bankAccountId) ?? "Cuenta vinculada") : "—"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold tabular-nums ${
                      item.type === "income" ? "text-emerald-400" : "text-foreground"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {item.bankAccountId ? formatCurrency(runningBalances.get(item.id) ?? 0) : "—"}
                  </TableCell>
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
