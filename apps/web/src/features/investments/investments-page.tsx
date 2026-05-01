import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { InvestmentPosition } from "@personal-finance/shared";
import { toast } from "sonner";
import { InvestmentFormDialog } from "@/components/forms/investment-form-dialog";
import { InvestmentMonthDialog } from "@/components/forms/investment-month-dialog";
import { InvestmentInsightsGrid } from "@/components/investments/investment-insights-grid";
import { InvestmentMonthlyRecords } from "@/components/investments/investment-monthly-records";
import { InvestmentProfitabilityChart } from "@/components/investments/investment-profitability-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchInvestments, createInvestment, updateInvestment } from "@/services/investments";
import { InvestmentFormValues } from "@/types/api";

const money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

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
  const [yearFilter, setYearFilter] = useState("all");
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

  useEffect(() => {
    if (!query.data?.items.length) {
      setActiveId(null);
      return;
    }

    if (!activeId || !query.data.items.some((item) => item.id === activeId)) {
      setActiveId(query.data.items[0].id);
    }
  }, [activeId, query.data?.items]);

  const activePlan = useMemo(
    () => query.data?.items.find((item) => item.id === activeId) ?? query.data?.items[0] ?? null,
    [activeId, query.data?.items],
  );

  useEffect(() => {
    if (!activePlan) return;
    const latestYear = activePlan.monthlyEntries.at(-1)?.month.slice(0, 4) ?? "all";
    setYearFilter(latestYear);
  }, [activePlan?.id]);

  const allEntries = activePlan?.monthlyEntries ?? [];
  const latestEntry = allEntries.at(-1);
  const currentEntry = allEntries.find((entry) => entry.month === currentMonthKey()) ?? latestEntry;
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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Inversión</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Sigue tu plan mensual, registra el cierre de cada mes y entiende de un vistazo si estás ganando o perdiendo.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/80 bg-card/70 p-1">
            <Button
              variant={period === "current" ? "default" : "ghost"}
              className="rounded-lg"
              onClick={() => setPeriod("current")}
            >
              Mes actual
            </Button>
            <Button
              variant={period === "historical" ? "default" : "ghost"}
              className="rounded-lg"
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
        <Card className="border-dashed border-border/80 bg-card/80">
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
            <div className="flex gap-2 overflow-x-auto pb-1">
              {query.data.items.map((item) => (
                <Button
                  key={item.id}
                  variant={item.id === activePlan.id ? "default" : "outline"}
                  className="rounded-full whitespace-nowrap"
                  onClick={() => setActiveId(item.id)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          )}

          <Card className="overflow-hidden border-border/80 bg-card/95">
            <CardContent className="p-0">
              <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6 p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Resumen actual
                      </p>
                      <h3 className="mt-2 text-3xl font-semibold tracking-tight">{activePlan.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {period === "current"
                          ? "Cierre del mes actual o ultimo disponible"
                          : "Ultimo cierre historico registrado"}
                      </p>
                    </div>
                    <Badge
                      className={
                        summaryPositive ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                      }
                    >
                      {summaryEntry?.month ?? "Sin cierres"}
                    </Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Total invertido</p>
                      <p className="mt-2 text-3xl font-semibold">{money.format(summaryEntry?.totalInvested ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Valor actual</p>
                      <p className="mt-2 text-3xl font-semibold">{money.format(summaryEntry?.endOfMonthValue ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Ganancia / Perdida</p>
                      <p
                        className={
                          summaryPositive
                            ? "mt-2 text-3xl font-semibold text-emerald-400"
                            : "mt-2 text-3xl font-semibold text-rose-400"
                        }
                      >
                        {money.format(summaryEntry?.profitabilityAmount ?? 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Rentabilidad</p>
                      <p
                        className={
                          summaryPositive
                            ? "mt-2 text-4xl font-semibold text-emerald-400"
                            : "mt-2 text-4xl font-semibold text-rose-400"
                        }
                      >
                        {(summaryEntry?.profitabilityPercentage ?? 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    summaryPositive
                      ? "flex flex-col justify-between bg-emerald-500/10 p-6 md:p-8"
                      : "flex flex-col justify-between bg-rose-500/10 p-6 md:p-8"
                  }
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Plan activo</span>
                    {summaryPositive ? (
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Broker</p>
                    <p className="mt-1 text-2xl font-semibold">{activePlan.platform || "Sin broker indicado"}</p>
                  </div>
                  <div className="rounded-xl bg-background/60 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ultimo resultado</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p
                      className={
                        summaryPositive
                          ? "mt-3 text-2xl font-semibold text-emerald-400"
                          : "mt-3 text-2xl font-semibold text-rose-400"
                      }
                    >
                      {money.format(summaryEntry?.profitabilityAmount ?? 0)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Sobre un acumulado de {money.format(summaryEntry?.totalInvested ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <InvestmentInsightsGrid
            entries={period === "current" ? chartEntries : allEntries}
            totalContributed={activePlan.totalContributed}
          />

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <InvestmentProfitabilityChart
              entries={chartEntries}
              title={period === "current" ? "Ultimos meses del plan activo" : "Evolucion completa del plan"}
            />
            <Card className="border-border/80 bg-card/95">
              <CardHeader>
                <CardTitle>Control financiero</CardTitle>
                <CardDescription>Vista rapida para entender la tendencia del plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Plan mensual actual</p>
                  <p className="mt-2 text-2xl font-semibold">{money.format(latestEntry?.contribution ?? 0)}</p>
                </div>
                <div className="rounded-xl bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Valor total de cartera</p>
                  <p className="mt-2 text-2xl font-semibold">{money.format(activePlan.currentValue)}</p>
                </div>
                <div className="rounded-xl bg-secondary/30 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Rentabilidad acumulada</p>
                  <p
                    className={
                      activePlan.profitabilityPercentage >= 0
                        ? "mt-2 text-2xl font-semibold text-emerald-400"
                        : "mt-2 text-2xl font-semibold text-rose-400"
                    }
                  >
                    {activePlan.profitabilityPercentage.toFixed(2)}%
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
            onYearChange={setYearFilter}
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
