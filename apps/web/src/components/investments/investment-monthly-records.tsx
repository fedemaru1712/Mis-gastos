import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { InvestmentPosition } from "@personal-finance/shared";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

const money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

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
    <Card className="border-border/80 bg-card/95">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Registro mensual</CardTitle>
          <CardDescription>Cierres del plan con filtros por año y orden.</CardDescription>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
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
        <div className="hidden overflow-hidden rounded-xl border border-border/80 lg:block">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Mes</th>
                <th className="px-4 py-3 font-medium">Aportación</th>
                <th className="px-4 py-3 font-medium">Valor final</th>
                <th className="px-4 py-3 font-medium">Resultado</th>
                <th className="px-4 py-3 font-medium">Rentabilidad</th>
                <th className="px-4 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.month} className="border-t border-border/70">
                  <td className="px-4 py-3 capitalize">{formatMonth(entry.month)}</td>
                  <td className="px-4 py-3">{money.format(entry.contribution)}</td>
                  <td className="px-4 py-3">{money.format(entry.endOfMonthValue)}</td>
                  <td
                    className={
                      entry.profitabilityAmount >= 0 ? "px-4 py-3 text-emerald-400" : "px-4 py-3 text-rose-400"
                    }
                  >
                    {money.format(entry.profitabilityAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        entry.profitabilityPercentage >= 0
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }
                    >
                      {entry.profitabilityPercentage.toFixed(2)}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => onEditMonth(entry.month)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 lg:hidden">
          {entries.map((entry) => (
            <div key={entry.month} className="rounded-xl border border-border/80 bg-secondary/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold capitalize">{formatMonth(entry.month)}</p>
                  <p className="text-xs text-muted-foreground">Aportación {money.format(entry.contribution)}</p>
                </div>
                <Badge
                  className={
                    entry.profitabilityPercentage >= 0
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                  }
                >
                  {entry.profitabilityPercentage.toFixed(2)}%
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Valor final</p>
                  <p className="font-semibold">{money.format(entry.endOfMonthValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resultado</p>
                  <p
                    className={
                      entry.profitabilityAmount >= 0 ? "font-semibold text-emerald-400" : "font-semibold text-rose-400"
                    }
                  >
                    {money.format(entry.profitabilityAmount)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" className="mt-3 w-full" onClick={() => onEditMonth(entry.month)}>
                Editar este registro
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
