import type { ReactNode } from "react";
import type { AnnualSummary } from "@/domain";
import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function AnnualSummaryOverview({ summary, extraCard }: { summary: AnnualSummary; extraCard?: ReactNode }) {
  const items = [
    { title: "Balance anual", value: summary.balance, icon: Scale },
    { title: "Ingresos anuales", value: summary.income, icon: ArrowUpCircle },
    { title: "Gastos anuales", value: summary.expense, icon: ArrowDownCircle },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map(({ title, value, icon: Icon }) => (
          <Card key={title} className="bg-card">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xs uppercase tracking-[0.14em] text-muted-foreground sm:whitespace-nowrap">
                {title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">
                {typeof value === "number" && title !== "Meses activos" ? formatCurrency(value) : value}
              </p>
            </CardContent>
          </Card>
        ))}
        {extraCard}
      </div>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Vista anual</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.months} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.45)" />
              <YAxis
                tickFormatter={(value) => formatCurrency(Number(value ?? 0))}
                tickLine={false}
                axisLine={false}
                width={72}
                stroke="rgba(255,255,255,0.45)"
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value ?? 0)),
                  name === "income" ? "Ingresos" : "Gastos",
                ]}
                contentStyle={{
                  backgroundColor: "#000000",
                  borderRadius: 18,
                }}
              />
              <Bar dataKey="income" fill="#76d29d" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#c87e7e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
