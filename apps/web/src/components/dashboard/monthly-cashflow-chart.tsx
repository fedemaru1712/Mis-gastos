import type { MonthlySummary } from "@personal-finance/shared";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function MonthlyCashflowChart({ summary }: { summary: MonthlySummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos y gastos</CardTitle>
        <CardDescription>Ingresos y gastos diarios del mes seleccionado.</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={summary.cashflow} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={18} />
            <YAxis
              tickFormatter={(value) => formatCurrency(Number(value ?? 0))}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value ?? 0)),
                name === "income" ? "Ingresos" : "Gastos",
              ]}
              labelFormatter={(label) => `Día ${label}`}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.96)",
                border: "1px solid rgba(51, 65, 85, 1)",
                borderRadius: 10,
              }}
            />
            <Area type="linear" dataKey="income" stroke="#22c55e" fill="url(#incomeFill)" strokeWidth={2} />
            <Area type="linear" dataKey="expense" stroke="#ef4444" fill="url(#expenseFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
