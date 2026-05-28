import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { InvestmentPosition } from "@/domain";
import { toast } from "sonner";
import { InvestmentFormDialog } from "@/components/forms/investment-form-dialog";
import { InvestmentMonthDialog } from "@/components/forms/investment-month-dialog";
import { InvestmentInsightsGrid } from "@/components/investments/investment-insights-grid";
import { InvestmentMonthlyRecords } from "@/components/investments/investment-monthly-records";
import { InvestmentProfitabilityChart } from "@/components/investments/investment-profitability-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { fetchInvestments, createInvestment, updateInvestment } from "@/services/investments";
import { InvestmentFormValues } from "@/types/api";

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function InvestmentsPage() {
  const queryClient = useQueryClient();
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [selected, setSelected] = useState<InvestmentPosition | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<InvestmentPosition["monthlyEntries"][number] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [period, setPeriod] = useState<"current" | "historical">("current");
  const [yearSelection, setYearSelection] = useState<{ planId: string | null; year: string }>({
    planId: null,
    year: "all",
  });
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const query = useQuery({ queryKey: ["investments"], queryFn: fetchInvestments });
  const mutation = useMutation({
    mutationFn: async (values: InvestmentFormValues) =>
      selected ? updateInvestment(selected.id, values) : createInvestment(values),
    onSuccess: () => {
      toast.success(selected ? "Inversión actualizada" : "Inversión creada");
      setPlanModalOpen(false);
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const monthMutation = useMutation({
    mutationFn: async (values: { month: string; contribution: number; endOfMonthValue: number }) => {
      if (!selected) throw new Error("No hay plan seleccionado");

      const monthlyEntries = [
        ...selected.monthlyEntries.filter((entry) => entry.month !== selectedMonth?.month),
        values,
      ].sort((left, right) => left.month.localeCompare(right.month));

      return updateInvestment(selected.id, {
        name: selected.name,
        type: selected.type,
        symbol: selected.symbol ?? "",
        platform: selected.platform ?? "",
        monthlyEntries,
      });
    },
    onSuccess: () => {
      toast.success(selectedMonth ? "Mes actualizado" : "Mes añadido");
      setMonthModalOpen(false);
      setSelectedMonth(null);
      void queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const items = query.data?.items ?? [];
  const resolvedActiveId = items.some((item) => item.id === activeId) ? activeId : (items[0]?.id ?? null);
  const activePlan = items.find((item) => item.id === resolvedActiveId) ?? null;

  const allEntries = activePlan?.monthlyEntries ?? [];
  const latestYear = allEntries.at(-1)?.month.slice(0, 4) ?? "all";
  const yearFilter = yearSelection.planId === activePlan?.id ? yearSelection.year : latestYear;
  const latestEntry = allEntries.at(-1);
  const currentEntry = allEntries.find((entry) => entry.month === currentMonthKey()) ?? null;
  const summaryEntry = period === "current" ? currentEntry : latestEntry;
  const summaryPositive = (summaryEntry?.profitabilityPercentage ?? 0) >= 0;
  const chartEntries = period === "current" ? allEntries.slice(-6) : allEntries;
  const availableYears = [...new Set(allEntries.map((entry) => entry.month.slice(0, 4)))].sort((left, right) =>
    right.localeCompare(left),
  );
  const registryEntries = [...allEntries]
    .filter((entry) => yearFilter === "all" || entry.month.startsWith(yearFilter))
    .sort((left, right) =>
      order === "desc" ? right.month.localeCompare(left.month) : left.month.localeCompare(right.month),
    );
  const portfolioValue = items.reduce((sum, item) => sum + item.currentValue, 0);
  const portfolioContribution = items.reduce((sum, item) => sum + item.totalContributed, 0);
  const portfolioProfitability = items.reduce((sum, item) => sum + item.profitabilityAmount, 0);
  const portfolioPositive = portfolioProfitability >= 0;
  const portfolioPercentage = portfolioContribution > 0 ? (portfolioProfitability / portfolioContribution) * 100 : 0;
  const topMovers = useMemo(
    () => [...items].sort((left, right) => right.profitabilityPercentage - left.profitabilityPercentage).slice(0, 4),
    [items],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="hidden lg:block">
          <h2 className="mt-1.5 text-[28px] font-semibold tracking-tight">Cartera</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-white/[0.06] p-0.5">
            <Button
              variant={period === "current" ? "default" : "ghost"}
              className="rounded-full"
              onClick={() => setPeriod("current")}
            >
              En curso
            </Button>
            <Button
              variant={period === "historical" ? "default" : "ghost"}
              className="rounded-full"
              onClick={() => setPeriod("historical")}
            >
              Histórico
            </Button>
          </div>
          {activePlan ? (
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setSelected(activePlan);
                setSelectedMonth(null);
                setMonthModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Añadir mes
            </Button>
          ) : (
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setSelected(null);
                setPlanModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo plan
            </Button>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <Card className="overflow-hidden bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Valor de cartera</p>
                <p className="mt-2 text-[34px] font-semibold tracking-tight sm:text-[40px]">
                  {formatCurrency(portfolioValue)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1">
                    {portfolioPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                    )}
                    <span className="text-muted-foreground">Resultado</span>
                    <span className={`font-medium ${portfolioPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      {portfolioPositive ? "+" : ""}
                      {formatCurrency(portfolioProfitability)} · {formatPercent(portfolioPercentage)}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-muted-foreground">
                    Aportado {formatCurrency(portfolioContribution)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 xl:min-w-[340px] xl:max-w-[460px] xl:flex-1">
                <div className="rounded-2xl bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Posiciones</p>
                  <p className="mt-1.5 text-lg font-semibold">{items.length}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Mejor activo</p>
                  <p className="mt-1.5 truncate text-sm font-semibold">
                    {topMovers[0]?.symbol || topMovers[0]?.name || "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Rentabilidad</p>
                  <p
                    className={`mt-1.5 text-lg font-semibold ${portfolioPositive ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {portfolioPositive ? "+" : ""}
                    {formatPercent(portfolioPercentage)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {query.isPending && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Cargando inversión...</CardContent>
        </Card>
      )}
      {query.isError && (
        <Card>
          <CardContent className="p-6 text-sm text-danger">{query.error.message}</CardContent>
        </Card>
      )}
      {query.data && query.data.items.length === 0 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Empieza tu seguimiento mensual</CardTitle>
            <CardDescription>
              Crea tu primer plan para registrar aportaciones, valor al cierre y rentabilidad mensual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setSelected(null);
                setPlanModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Crear plan de inversión
            </Button>
          </CardContent>
        </Card>
      )}

      {activePlan && (
        <>
          {query.data && query.data.items.length > 1 && (
            <Card className="bg-card">
              <CardContent className="space-y-1 p-2">
                {query.data.items.map((item) => {
                  const isActive = item.id === activePlan.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        isActive
                          ? "flex w-full items-center gap-3 rounded-2xl bg-white/[0.05] px-3 py-2.5 text-left"
                          : "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-white/[0.03]"
                      }
                      onClick={() => setActiveId(item.id)}
                    >
                      <span
                        className={
                          isActive
                            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-black"
                            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-white"
                        }
                      >
                        {(item.symbol || item.name).slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{item.symbol || item.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {formatCurrency(item.currentValue)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span
                          className={`block text-sm font-semibold tabular-nums ${item.profitabilityAmount >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {item.profitabilityAmount >= 0 ? "+" : ""}
                          {formatCurrency(item.profitabilityAmount)}
                        </span>
                        <span
                          className={`block text-xs tabular-nums ${item.profitabilityPercentage >= 0 ? "text-emerald-400/70" : "text-rose-400/70"}`}
                        >
                          {formatPercent(item.profitabilityPercentage)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden bg-card">
            <CardContent className="p-0">
              <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-5 p-5 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Posición activa</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{activePlan.name}</h3>
                    </div>
                    <Badge
                      className={
                        summaryPositive ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"
                      }
                    >
                      {summaryEntry?.month ?? (period === "current" ? "Sin cierre actual" : "Sin cierres")}
                    </Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Total invertido</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                        {formatCurrency(summaryEntry?.totalInvested ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Valor actual</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                        {formatCurrency(summaryEntry?.endOfMonthValue ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Ganancia / Pérdida</p>
                      <p
                        className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${summaryPositive ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {summaryPositive ? "+" : ""}
                        {formatCurrency(summaryEntry?.profitabilityAmount ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Rentabilidad</p>
                      <p
                        className={`mt-2 text-3xl font-semibold tracking-tight sm:text-4xl ${summaryPositive ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {summaryPositive ? "+" : ""}
                        {formatPercent(summaryEntry?.profitabilityPercentage ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-5 border-t border-white/[0.05] p-5 md:p-7 lg:border-l lg:border-t-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan activo</span>
                    {summaryPositive ? (
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Broker</p>
                    <p className="mt-1.5 text-2xl font-semibold">{activePlan.platform || "Sin broker indicado"}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Último resultado</span>
                      {summaryPositive ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-rose-400" />
                      )}
                    </div>
                    <p className={`mt-3 text-2xl font-semibold ${summaryPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      {summaryPositive ? "+" : ""}
                      {formatCurrency(summaryEntry?.profitabilityAmount ?? 0)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sobre {formatCurrency(summaryEntry?.totalInvested ?? 0)} invertidos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <InvestmentInsightsGrid entries={chartEntries} totalContributed={activePlan.totalContributed} />

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <InvestmentProfitabilityChart
              entries={chartEntries}
              title={period === "current" ? "Últimos meses del plan activo" : "Evolución completa del plan"}
            />
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Lectura rápida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Última aportación mensual
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(latestEntry?.contribution ?? 0)}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Valor actual del plan
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(activePlan.currentValue)}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Rentabilidad acumulada
                  </p>
                  <p
                    className={`mt-2 text-2xl font-semibold ${activePlan.profitabilityPercentage >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {activePlan.profitabilityPercentage >= 0 ? "+" : ""}
                    {formatPercent(activePlan.profitabilityPercentage)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <InvestmentMonthlyRecords
            entries={registryEntries}
            years={availableYears}
            year={yearFilter}
            order={order}
            onYearChange={(value) => setYearSelection({ planId: activePlan.id, year: value })}
            onOrderChange={setOrder}
            onEditPlan={() => {
              setSelected(activePlan);
              setPlanModalOpen(true);
            }}
            onEditMonth={(month) => {
              setSelected(activePlan);
              setSelectedMonth(activePlan.monthlyEntries.find((entry) => entry.month === month) ?? null);
              setMonthModalOpen(true);
            }}
          />
        </>
      )}
      <InvestmentFormDialog
        open={planModalOpen}
        investment={selected}
        onOpenChange={(next) => {
          setPlanModalOpen(next);
          if (!next) setSelected(null);
        }}
        onSubmit={async (values) => {
          await mutation.mutateAsync(values);
        }}
      />
      <InvestmentMonthDialog
        open={monthModalOpen}
        investment={selected}
        monthEntry={selectedMonth}
        onOpenChange={(next) => {
          setMonthModalOpen(next);
          if (!next) setSelectedMonth(null);
        }}
        onSubmit={async (values) => {
          await monthMutation.mutateAsync(values);
        }}
      />
    </section>
  );
}
