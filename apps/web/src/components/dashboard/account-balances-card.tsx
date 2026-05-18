import { Landmark } from "lucide-react";
import { MonthlySummary } from "@/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function AccountBalancesCard({
  summary,
  description = "Hasta el cierre del mes seleccionado",
}: {
  summary: MonthlySummary;
  description?: string;
}) {
  const totalBalance = summary.accountBalances.reduce((sum, account) => sum + account.balance, 0);

  return (
    <Card className="bg-card">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Saldos por cuenta</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Landmark className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {summary.accountBalances.length ? (
          <>
            <div className="rounded-2xl bg-secondary/55 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Total en cuentas</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {summary.accountBalances.map((account) => (
                <div key={account.id} className="rounded-2xl bg-secondary/35 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{account.bankName}</p>
                    <p className="truncate text-xs text-muted-foreground">{account.accountName}</p>
                  </div>
                  <p
                    className={
                      account.balance < 0
                        ? "mt-3 text-xl font-semibold tracking-tight text-rose-300"
                        : "mt-3 text-xl font-semibold tracking-tight"
                    }
                  >
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
            Aún no hay cuentas bancarias configuradas.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
