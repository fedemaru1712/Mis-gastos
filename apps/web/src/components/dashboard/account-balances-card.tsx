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
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <Landmark className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {summary.accountBalances.length ? (
          <>
            <div className="flex items-baseline justify-between rounded-2xl bg-white/[0.04] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold tracking-tight">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {summary.accountBalances.map((account) => (
                <div key={account.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{account.bankName}</p>
                    <p className="truncate text-xs text-muted-foreground">{account.accountName}</p>
                  </div>
                  <p
                    className={`shrink-0 pl-4 text-sm font-semibold tabular-nums ${
                      account.balance < 0 ? "text-rose-400" : "text-foreground"
                    }`}
                  >
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-white/[0.04] px-4 py-6 text-center text-sm text-muted-foreground">
            Aún no hay cuentas bancarias configuradas.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
