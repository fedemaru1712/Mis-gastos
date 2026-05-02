import type { AnnualSummary } from "@personal-finance/shared";
import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const amountFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function AnnualSummaryOverview({ summary }: { summary: AnnualSummary }) {
  const items = [
    { title: "Balance anual", value: summary.balance, icon: Scale },
    { title: "Ingresos anuales", value: summary.income, icon: ArrowUpCircle },
    { title: "Gastos anuales", value: summary.expense, icon: ArrowDownCircle },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        {items.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm text-muted-foreground sm:whitespace-nowrap">{title}</CardTitle>
              <Icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {typeof value === "number" && title !== "Meses activos" ? amountFormatter.format(value) : value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vista anual</CardTitle>
          <CardDescription>Comparativa de ingresos y gastos por mes.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.months} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(value) => amountFormatter.format(value)}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value, name) => [
                  amountFormatter.format(Number(value ?? 0)),
                  name === "income" ? "Ingresos" : "Gastos",
                ]}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.96)",
                  border: "1px solid rgba(51, 65, 85, 1)",
                  borderRadius: 10,
                }}
              />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
