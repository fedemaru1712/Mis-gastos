import { useNavigate } from "react-router-dom";
import { MonthlySummary } from "@/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { getCategoryTone } from "@/lib/category-colors";

function formatTransactionDate(dateString: string): string {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return "Hoy";
  if (date.getTime() === yesterday.getTime()) return "Ayer";

  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function RecentTransactions({ summary }: { summary: MonthlySummary }) {
  const navigate = useNavigate();
  const recentItems = summary.recentTransactions.slice(0, 5);

  return (
    <Card className="bg-card">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Últimos movimientos</CardTitle>
        <button
          type="button"
          onClick={() => navigate("/transactions")}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver todos →
        </button>
      </CardHeader>
      <CardContent>
        {recentItems.length ? (
          <div className="divide-y divide-white/[0.05]">
            {recentItems.map((item) => {
              const tone = getCategoryTone(item.category);
              return (
                <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${tone.dot}22` }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tone.dot }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: tone.text }}>
                      {item.category}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.description || "Sin descripción"}
                      {item.date && (
                        <>
                          {" "}
                          <span className="opacity-50">·</span>{" "}
                          {formatTransactionDate(item.date)}
                        </>
                      )}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      item.type === "income" ? "text-emerald-400" : "text-foreground"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay movimientos para este mes.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
