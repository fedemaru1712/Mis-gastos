import type { InvestmentPosition } from "@personal-finance/shared";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

export function InvestmentPerformanceCard({
  investment,
  onEdit,
  onDelete,
}: {
  investment: InvestmentPosition;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const positive = investment.profitabilityPercentage >= 0;

  return (
    <Card className="overflow-hidden border-border/70 bg-secondary/20">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{investment.name}</CardTitle>
            <CardDescription>{investment.platform || investment.symbol || investment.type}</CardDescription>
          </div>
          {positive ? (
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          ) : (
            <TrendingDown className="h-5 w-5 text-rose-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Total invertido</p>
            <p className="mt-1 font-semibold">{formatCurrency(investment.totalContributed)}</p>
          </div>
          <div className="rounded-md bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">Valor actual</p>
            <p className="mt-1 font-semibold">{formatCurrency(investment.currentValue)}</p>
          </div>
        </div>
        <div className="rounded-md bg-background/50 p-3">
          <p className="text-xs text-muted-foreground">Rentabilidad total</p>
          <p className={positive ? "mt-1 font-semibold text-emerald-400" : "mt-1 font-semibold text-rose-400"}>
            {formatCurrency(investment.profitabilityAmount)} · {formatPercent(investment.profitabilityPercentage)}
          </p>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={investment.monthlyEntries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={`invested-${investment.id}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id={`value-${investment.id}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.24} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="month" tickFormatter={(value) => value.slice(5)} tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(value) => formatNumber(Number(value ?? 0))}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value ?? 0)),
                  name === "totalInvested" ? "Total invertido" : "Valor mercado",
                ]}
                labelFormatter={(label) => `Mes ${label}`}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.96)",
                  border: "1px solid rgba(51,65,85,1)",
                  borderRadius: 10,
                }}
              />
              <Area
                type="linear"
                dataKey="totalInvested"
                stroke="#38bdf8"
                fill={`url(#invested-${investment.id})`}
                strokeWidth={2}
              />
              <Area
                type="linear"
                dataKey="endOfMonthValue"
                stroke="#22c55e"
                fill={`url(#value-${investment.id})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {investment.monthlyEntries
            .slice(-3)
            .reverse()
            .map((entry) => (
              <div
                key={entry.month}
                className="flex items-center justify-between rounded-md bg-background/40 px-3 py-2 text-sm"
              >
                <span>{entry.month}</span>
                <span className="text-muted-foreground">Aporte {formatCurrency(entry.contribution)}</span>
                <span className={entry.profitabilityPercentage >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {formatPercent(entry.profitabilityPercentage)}
                </span>
              </div>
            ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="danger" className="flex-1" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
