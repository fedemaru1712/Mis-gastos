import type { InvestmentPosition } from "@/domain";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Rentabilidad mensual</CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
            <div className="rounded-3xl bg-secondary/40 p-6 text-sm text-muted-foreground">
              Aún no hay cierres suficientes para dibujar la evolución.
            </div>
          ) : (
          <div className="overflow-x-auto">
            <div className="h-72 min-w-[320px] sm:min-w-[520px] lg:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={entries} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="2 6" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={(value) => value.slice(5)} tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.32)" />
                  <YAxis
                    tickFormatter={(value) => formatPercent(Number(value ?? 0))}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    stroke="rgba(255,255,255,0.32)"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
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
                      backgroundColor: "#000000",
                      borderRadius: 18,
                    }}
                  />
                  <Line type="monotone" dataKey="profitabilityPercentage" stroke="#ffffff" strokeWidth={1.8} dot={false} activeDot={{ r: 3, fill: "#ffffff" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
