import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import { MonthlySummary } from "@personal-finance/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatCurrency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function SummaryCards({ summary }: { summary: MonthlySummary }) {
  const items = [
    { title: "Balance", value: summary.balance, icon: Scale },
    { title: "Ingresos", value: summary.income, icon: ArrowUpCircle },
    { title: "Gastos", value: summary.expense, icon: ArrowDownCircle },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ title, value, icon: Icon }) => (
        <Card key={title}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
            <Icon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatCurrency.format(value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
