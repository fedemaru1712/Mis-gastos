import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { AnnualSummaryOverview } from "@/components/dashboard/annual-summary-overview";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { LoansSummaryCard } from "@/components/dashboard/loans-summary-card";
import { MonthlyCashflowChart } from "@/components/dashboard/monthly-cashflow-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MonthPickerField } from "@/components/forms/month-picker-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useLoansQuery } from "@/hooks/use-loans";
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
  const loansQuery = useLoansQuery();
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
    const totalPortfolio = investmentsQuery.data?.items.reduce((sum, item) => sum + item.currentValue, 0) ?? 0;
    const monthSavingsRate =
      monthlyQuery.data.income > 0 ? (monthlyQuery.data.balance / monthlyQuery.data.income) * 100 : 0;

    return (
      <div className="space-y-4">
        <Card className="overflow-hidden bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Balance total del mes</p>
                <p className="mt-2 text-[34px] font-semibold tracking-tight sm:text-[42px]">
                  {formatCurrency(monthlyQuery.data.balance)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/85 px-2.5 py-1">
                    <ArrowUpRight className="h-4 w-4 text-emerald-300" />
                    Ingresos {formatCurrency(monthlyQuery.data.income)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/85 px-2.5 py-1">
                    <ArrowDownRight className="h-4 w-4 text-rose-300" />
                    Gastos {formatCurrency(monthlyQuery.data.expense)}
                  </span>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[380px] lg:max-w-[500px] lg:flex-1">
                <div className="rounded-2xl bg-secondary/60 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ahorro del mes</p>
                  <p className="mt-1.5 text-xl font-semibold">{formatPercent(monthSavingsRate)}</p>
                </div>
                <div className="rounded-2xl bg-secondary/60 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Cartera</p>
                  <p className="mt-1.5 text-xl font-semibold">{formatCurrency(totalPortfolio)}</p>
                </div>
                <div className="rounded-2xl bg-secondary/60 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Resultado inversión</p>
                  <p
                    className={
                      investmentProfitability !== null && investmentProfitability < 0
                        ? "mt-1.5 text-xl font-semibold text-rose-300"
                        : "mt-1.5 text-xl font-semibold text-emerald-300"
                    }
                  >
                    {formatCurrency(investmentProfitability ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <SummaryCards summary={monthlyQuery.data} investmentProfitability={investmentProfitability} />
        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr] xl:items-stretch">
          <MonthlyCashflowChart summary={monthlyQuery.data} />
          <ExpenseChart summary={monthlyQuery.data} />
        </div>
        <AnnualSummaryOverview
          summary={annualQuery.data}
          extraCard={
            <LoansSummaryCard
              loans={loansQuery.data?.items}
              isLoading={loansQuery.isPending}
              errorMessage={loansQuery.isError ? loansQuery.error.message : null}
            />
          }
        />
        <RecentTransactions summary={monthlyQuery.data} />
      </div>
    );
  }, [
    annualQuery.data,
    annualQuery.error,
    annualQuery.isError,
    annualQuery.isPending,
    investmentsQuery.data,
    loansQuery.data?.items,
    loansQuery.error,
    loansQuery.isError,
    loansQuery.isPending,
    monthlyQuery.data,
    monthlyQuery.error,
    monthlyQuery.isError,
    monthlyQuery.isPending,
  ]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="hidden lg:block">
          <h2 className="mt-1.5 text-[28px] font-semibold tracking-tight">Resumen</h2>
        </div>
        <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" className="w-full sm:w-auto" onClick={goToCurrentMonth}>
            <Wallet className="h-4 w-4" />
            Mes actual
          </Button>
          <MonthPickerField
            value={month}
            onChange={setMonth}
            year={year}
            onYearChange={setYear}
            className="w-full sm:w-56"
          />
        </div>
      </div>
      {content}
    </section>
  );
}
