import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { MonthlySummary } from "@/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { getCategoryTone } from "@/lib/category-colors";

export function ExpenseChart({ summary }: { summary: MonthlySummary }) {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle>Gastos por categoría</CardTitle>
      </CardHeader>
      <CardContent>
        {summary.expenseByCategory.length ? (
          <div className="relative h-[21.5rem] sm:h-[24rem]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={summary.expenseByCategory}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={86}
                  outerRadius={122}
                  paddingAngle={2}
                  stroke="none"
                >
                  {summary.expenseByCategory.map((entry, index) => (
                    <Cell key={`${entry.category}-${index}`} fill={getCategoryTone(entry.category).chart} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  contentStyle={{
                    backgroundColor: "#000000",
                    borderRadius: 18,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total gasto</span>
              <span className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {formatCurrency(summary.expense)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-[21.5rem] items-center justify-center rounded-3xl bg-secondary/55 text-sm text-muted-foreground sm:h-[24rem]">
            No hay gastos cargados este mes.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
