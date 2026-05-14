import { ArrowDownCircle, ArrowUpCircle, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { MonthlySummary } from "@/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function SummaryCards({
  summary,
  investmentProfitability,
}: {
  summary: MonthlySummary;
  investmentProfitability?: number | null;
}) {
  const items = [
    { title: "Balance", value: summary.balance, icon: Scale, valueClassName: "text-foreground" },
    { title: "Ingresos", value: summary.income, icon: ArrowUpCircle, valueClassName: "text-foreground" },
    { title: "Gastos", value: summary.expense, icon: ArrowDownCircle, valueClassName: "text-foreground" },
  ];

  if (investmentProfitability !== undefined && investmentProfitability !== null) {
    items.push({
      title: "Mis inversiones",
      value: investmentProfitability,
      icon: investmentProfitability >= 0 ? TrendingUp : TrendingDown,
      valueClassName: investmentProfitability >= 0 ? "text-emerald-400" : "text-rose-400",
    });
  }

  return (
    <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
      {items.map(({ title, value, icon: Icon, valueClassName }) => (
        <Card key={title} className="bg-card">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{title}</CardTitle>
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className={`text-[28px] font-semibold tracking-tight ${valueClassName}`}>{formatCurrency(value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
