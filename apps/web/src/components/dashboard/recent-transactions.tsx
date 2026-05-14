import { MonthlySummary } from "@/domain";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { getCategoryTone } from "@/lib/category-colors";

export function RecentTransactions({ summary }: { summary: MonthlySummary }) {
  const recentItems = summary.recentTransactions.slice(0, 3);

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Últimos movimientos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentItems.length ? (
          recentItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-3xl bg-secondary/50 px-4 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getCategoryTone(item.category).dot }} />
                  <p className={`font-medium ${getCategoryTone(item.category).text}`}>{item.category}</p>
                </div>
                <p className="text-sm text-muted-foreground">{item.description || "Sin descripción"}</p>
              </div>
              <div className="text-right">
                <Badge variant={item.type} className="mb-2">
                  {item.type === "income" ? "Ingreso" : "Gasto"}
                </Badge>
                <p className="font-semibold">{formatCurrency(item.amount)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl bg-secondary/50 p-4 text-sm text-muted-foreground">
            Aún no hay movimientos para este mes.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
