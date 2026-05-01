import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { MonthlySummary } from "@personal-finance/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const colors = ["#0f766e", "#14b8a6", "#f59e0b", "#f97316", "#ef4444", "#6366f1"];

export function ExpenseChart({ summary }: { summary: MonthlySummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por categoría</CardTitle>
        <CardDescription>Distribución de gastos del mes seleccionado.</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {summary.expenseByCategory.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summary.expenseByCategory}
                dataKey="total"
                nameKey="category"
                innerRadius={70}
                outerRadius={110}
              >
                {summary.expenseByCategory.map((entry, index) => (
                  <Cell key={entry.category} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl bg-secondary text-sm text-muted-foreground">
            No hay gastos cargados este mes.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
