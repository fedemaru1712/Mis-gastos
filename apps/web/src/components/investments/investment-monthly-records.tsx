import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { InvestmentPosition } from "@/domain";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatPercent } from "@/lib/format";

function formatMonth(month: string) {
  return format(new Date(`${month}-01T00:00:00`), "MMMM yyyy", { locale: es });
}

export function InvestmentMonthlyRecords({
  entries,
  years,
  year,
  order,
  onYearChange,
  onOrderChange,
  onEditPlan,
  onEditMonth,
}: {
  entries: InvestmentPosition["monthlyEntries"];
  years: string[];
  year: string;
  order: "desc" | "asc";
  onYearChange: (value: string) => void;
  onOrderChange: (value: "desc" | "asc") => void;
  onEditPlan: () => void;
  onEditMonth: (month: string) => void;
}) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle>Registro mensual</CardTitle>
        <div className="grid gap-2 sm:grid-cols-2 lg:flex">
          <Select value={year} onChange={(event) => onYearChange(event.target.value)} className="min-w-[9rem]">
            <option value="all">Todos los años</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            value={order}
            onChange={(event) => onOrderChange(event.target.value as "desc" | "asc")}
            className="min-w-[9rem]"
          >
            <option value="desc">Más reciente</option>
            <option value="asc">Más antiguo</option>
          </Select>
          <Button variant="outline" onClick={onEditPlan}>
            <Pencil className="h-4 w-4" />
            Editar plan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile: TR-style divider rows */}
        <div className="divide-y divide-white/[0.05] lg:hidden">
          {entries.map((entry) => {
            const positive = entry.profitabilityAmount >= 0;
            return (
              <div key={entry.month} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium capitalize">{formatMonth(entry.month)}</p>
                  <p className="text-xs text-muted-foreground">
                    Aportación {formatCurrency(entry.contribution)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(entry.endOfMonthValue)}
                  </p>
                  <p className={`text-xs font-medium tabular-nums ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                    {positive ? "+" : ""}{formatCurrency(entry.profitabilityAmount)}
                    {" · "}
                    {positive ? "+" : ""}{formatPercent(entry.profitabilityPercentage)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEditMonth(entry.month)}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          {entries.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Sin registros para este periodo.</p>
          )}
        </div>

        {/* Desktop: clean table */}
        <div className="hidden overflow-hidden rounded-2xl bg-white/[0.03] lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04] text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-4 py-3 font-medium">Mes</th>
                <th className="px-4 py-3 font-medium">Aportación</th>
                <th className="px-4 py-3 font-medium">Valor final</th>
                <th className="px-4 py-3 font-medium">Resultado</th>
                <th className="px-4 py-3 font-medium">Rentabilidad</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {entries.map((entry) => {
                const positive = entry.profitabilityAmount >= 0;
                return (
                  <tr key={entry.month} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium capitalize">{formatMonth(entry.month)}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {formatCurrency(entry.contribution)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(entry.endOfMonthValue)}</td>
                    <td className={`px-4 py-3 font-semibold tabular-nums ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                      {positive ? "+" : ""}{formatCurrency(entry.profitabilityAmount)}
                    </td>
                    <td className={`px-4 py-3 font-semibold tabular-nums ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                      {positive ? "+" : ""}{formatPercent(entry.profitabilityPercentage)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => onEditMonth(entry.month)}>
                        Editar
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Sin registros para este periodo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
