import { MonthlySummary } from "@personal-finance/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const amountFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function RecentTransactions({ summary }: { summary: MonthlySummary }) {
  const recentItems = summary.recentTransactions.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos movimientos</CardTitle>
        <CardDescription>Los 3 movimientos más recientes del mes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentItems.length ? (
          recentItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
              <div>
                <p className="font-medium">{item.category}</p>
                <p className="text-sm text-muted-foreground">{item.description || "Sin descripción"}</p>
              </div>
              <div className="text-right">
                <Badge variant={item.type} className="mb-2">
                  {item.type === "income" ? "Ingreso" : "Gasto"}
                </Badge>
                <p className="font-semibold">{amountFormatter.format(item.amount)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
            Aún no hay movimientos para este mes.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
