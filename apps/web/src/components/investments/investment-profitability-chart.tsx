import type { InvestmentPosition } from "@personal-finance/shared";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";

export function InvestmentProfitabilityChart({
  entries,
  title,
}: {
  entries: InvestmentPosition["monthlyEntries"];
  title: string;
}) {
  return (
    <Card className="border-border/80 bg-card/95">
      <CardHeader>
        <CardTitle>Rentabilidad mensual</CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Aún no hay cierres suficientes para dibujar la evolución.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="h-72 min-w-[320px] sm:min-w-[520px] lg:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entries} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={(value) => value.slice(5)} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => formatPercent(Number(value ?? 0))}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                    formatter={(value, name, payload) => {
                      if (name === "profitabilityPercentage") {
                        return [formatPercent(Number(value ?? 0)), "Rentabilidad"];
                      }

                      const entry = payload.payload as InvestmentPosition["monthlyEntries"][number];
                      return [formatCurrency(entry.profitabilityAmount), "Resultado"];
                    }}
                    labelFormatter={(label, payload) => {
                      const entry = payload?.[0]?.payload as InvestmentPosition["monthlyEntries"][number] | undefined;
                      if (!entry) return label;

                      return `${label} · Aporte ${formatCurrency(entry.contribution)} · Resultado ${formatCurrency(entry.profitabilityAmount)}`;
                    }}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.96)",
                      border: "1px solid rgba(51,65,85,1)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="profitabilityPercentage" radius={[10, 10, 0, 0]}>
                    {entries.map((entry) => (
                      <Cell key={entry.month} fill={entry.profitabilityPercentage >= 0 ? "#22c55e" : "#f43f5e"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
