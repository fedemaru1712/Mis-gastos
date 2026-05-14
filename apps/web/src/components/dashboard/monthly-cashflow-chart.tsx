import type { MonthlySummary } from "@/domain";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function MonthlyCashflowChart({ summary }: { summary: MonthlySummary }) {
  const legendItems = [
    { label: "Ingresos", color: "#6EE7A8" },
    { label: "Gastos", color: "#FF5C5C" },
  ];

  return (
    <Card className="bg-card">
      <CardHeader className="gap-3 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Ingresos y gastos</CardTitle>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">Resumen mensual</p>
          </div>
          <div className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Este mes
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[24rem] sm:h-[25rem] lg:h-[26rem]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={summary.cashflow} margin={{ top: 12, right: 10, left: 24, bottom: 6 }}>
              <defs>
                <linearGradient id="incomeAreaFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#6EE7A8" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6EE7A8" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="expenseAreaFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#FF5C5C" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#FF5C5C" stopOpacity={0.015} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255, 255, 255, 0.07)" strokeDasharray="2 8" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                minTickGap={14}
                tickMargin={10}
                stroke="rgba(255,255,255,0.34)"
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(Number(value ?? 0))}
                tickLine={false}
                axisLine={false}
                width={96}
                tickMargin={12}
                stroke="rgba(255,255,255,0.34)"
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value ?? 0)),
                  name === "income" ? "Ingresos" : "Gastos",
                ]}
                labelFormatter={(label) => `Día ${label}`}
                contentStyle={{
                  backgroundColor: "#000000",
                  borderRadius: 18,
                }}
              />
              <Area type="monotone" dataKey="income" fill="url(#incomeAreaFill)" stroke="none" />
              <Area type="monotone" dataKey="expense" fill="url(#expenseAreaFill)" stroke="none" />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#6EE7A8"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 3.5, fill: "#6EE7A8" }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#FF5C5C"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3.5, fill: "#FF5C5C" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {legendItems.map((item) => (
            <div key={`legend-${item.label}`} className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
