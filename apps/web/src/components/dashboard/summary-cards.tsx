import { ArrowDownCircle, ArrowUpCircle, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { MonthlySummary } from "@personal-finance/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatCurrency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map(({ title, value, icon: Icon, valueClassName }) => (
        <Card key={title}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
            <Icon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-semibold ${valueClassName}`}>{formatCurrency.format(value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
