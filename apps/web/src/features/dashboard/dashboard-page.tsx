import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnnualSummaryOverview } from "@/components/dashboard/annual-summary-overview";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { MonthlyCashflowChart } from "@/components/dashboard/monthly-cashflow-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MonthPickerField } from "@/components/forms/month-picker-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchInvestments } from "@/services/investments";
import { fetchAnnualSummary, fetchMonthlySummary } from "@/services/summary";

export function DashboardPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(() => new Date().toISOString().slice(0, 4));

  function goToCurrentMonth() {
    const currentDate = new Date().toISOString();
    setMonth(currentDate.slice(0, 7));
    setYear(currentDate.slice(0, 4));
  }

  const monthlyQuery = useQuery({ queryKey: ["summary", month], queryFn: () => fetchMonthlySummary(month) });
  const annualQuery = useQuery({ queryKey: ["summary", "annual", year], queryFn: () => fetchAnnualSummary(year) });
  const investmentsQuery = useQuery({ queryKey: ["investments"], queryFn: fetchInvestments });
  const content = useMemo(() => {
    if (monthlyQuery.isPending || annualQuery.isPending) {
      return (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Cargando resumen...</CardContent>
        </Card>
      );
    }
    if (monthlyQuery.isError || annualQuery.isError) {
      return (
        <Card>
          <CardContent className="p-6 text-sm text-danger">
            {(monthlyQuery.error ?? annualQuery.error)?.message}
          </CardContent>
        </Card>
      );
    }
    if (!monthlyQuery.data || !annualQuery.data) {
      return null;
    }

    const investmentProfitability = investmentsQuery.data?.items.length
      ? investmentsQuery.data.items.reduce((sum, item) => sum + item.profitabilityAmount, 0)
      : null;

    return (
      <div className="space-y-6">
        <SummaryCards summary={monthlyQuery.data} investmentProfitability={investmentProfitability} />
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <MonthlyCashflowChart summary={monthlyQuery.data} />
          <ExpenseChart summary={monthlyQuery.data} />
        </div>
        <AnnualSummaryOverview summary={annualQuery.data} />
        <RecentTransactions summary={monthlyQuery.data} />
      </div>
    );
  }, [
    annualQuery.data,
    annualQuery.error,
    annualQuery.isError,
    annualQuery.isPending,
    investmentsQuery.data,
    monthlyQuery.data,
    monthlyQuery.error,
    monthlyQuery.isError,
    monthlyQuery.isPending,
  ]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Balance mensual, serie de ingresos y gastos, y vista anual del resumen.
          </p>
        </div>
        <div className="flex flex-col justify-end gap-3 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto" onClick={goToCurrentMonth}>
            Mes en curso
          </Button>
          <MonthPickerField
            value={month}
            onChange={setMonth}
            year={year}
            onYearChange={setYear}
            className="w-full sm:w-52"
          />
        </div>
      </div>
      {content}
    </section>
  );
}
