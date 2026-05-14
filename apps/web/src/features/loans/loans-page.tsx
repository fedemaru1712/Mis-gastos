import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Landmark, Plus } from "lucide-react";
import { type Loan, type LoanPayment } from "@/domain";
import { toast } from "sonner";
import { LoanFormDialog } from "@/components/forms/loan-form-dialog";
import { LoanPaymentDialog } from "@/components/forms/loan-payment-dialog";
import { LoanDetailPanel } from "@/components/loans/loan-detail-panel";
import { LoanList } from "@/components/loans/loan-list";
import { LoanPaymentHistory } from "@/components/loans/loan-payment-history";
import { LoanSummaryCards } from "@/components/loans/loan-summary-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoanPaymentsQuery, useLoansQuery } from "@/hooks/use-loans";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  createLoan,
  createLoanPayment,
  deleteLoan,
  deleteLoanPayment,
  updateLoan,
  updateLoanPayment,
} from "@/services/loans";
import { LoanFormValues, LoanPaymentFormValues } from "@/types/api";

export function LoansPage() {
  const queryClient = useQueryClient();
  const loansQuery = useLoansQuery();
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<LoanPayment | null>(null);
  const [activeLoanId, setActiveLoanId] = useState<string | null>(null);

  const loans = loansQuery.data?.items ?? [];
  const resolvedActiveLoanId = loans.some((loan) => loan.id === activeLoanId) ? activeLoanId : (loans[0]?.id ?? null);
  const activeLoan = loans.find((loan) => loan.id === resolvedActiveLoanId) ?? null;
  const paymentsQuery = useLoanPaymentsQuery(activeLoan?.id);
  const payments = paymentsQuery.data?.items ?? [];
  const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
  const totalMonthly = loans.reduce((sum, loan) => sum + (loan.status === "active" ? loan.monthlyPayment : 0), 0);
  const averageProgress =
    loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.progressPercentage, 0) / loans.length : 0;

  const loanMutation = useMutation({
    mutationFn: async (values: LoanFormValues) => {
      if (selectedLoan) return updateLoan(selectedLoan.id, values);
      return createLoan(values);
    },
    onSuccess: () => {
      toast.success(selectedLoan ? "Préstamo actualizado" : "Préstamo creado");
      setLoanDialogOpen(false);
      setSelectedLoan(null);
      void queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteLoanMutation = useMutation({
    mutationFn: (loan: Loan) => deleteLoan(loan.id),
    onSuccess: () => {
      toast.success("Préstamo eliminado");
      setSelectedLoan(null);
      void queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const paymentMutation = useMutation({
    mutationFn: async (values: LoanPaymentFormValues) => {
      if (!selectedLoan) throw new Error("No hay préstamo seleccionado");
      if (selectedPayment) return updateLoanPayment(selectedLoan.id, selectedPayment.id, values);
      return createLoanPayment(selectedLoan.id, values);
    },
    onSuccess: async () => {
      toast.success(selectedPayment ? "Pago actualizado" : "Pago registrado");
      setPaymentDialogOpen(false);
      setSelectedPayment(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["loans"] }),
        queryClient.invalidateQueries({ queryKey: ["loan-payments", selectedLoan?.id] }),
      ]);
    },
    onError: (error) => toast.error(error.message),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (payment: LoanPayment) => {
      if (!activeLoan) throw new Error("No hay préstamo seleccionado");
      return deleteLoanPayment(activeLoan.id, payment.id);
    },
    onSuccess: async () => {
      toast.success("Pago eliminado");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["loans"] }),
        queryClient.invalidateQueries({ queryKey: ["loan-payments", activeLoan?.id] }),
      ]);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="hidden lg:block">
          <h2 className="mt-1.5 text-[28px] font-semibold tracking-tight">Préstamos</h2>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setSelectedLoan(null);
            setLoanDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nuevo préstamo
        </Button>
      </div>

      {loans.length > 0 && (
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pendiente total</p>
                <p className="mt-2 text-[34px] font-semibold tracking-tight sm:text-[40px]">
                  {formatCurrency(totalRemaining)}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-2.5 py-1 text-[13px] text-muted-foreground">
                  <Landmark className="h-4 w-4 text-primary" />
                  Cuotas activas {formatCurrency(totalMonthly)}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-2xl bg-secondary/60 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Préstamos</p>
                  <p className="mt-1.5 text-xl font-semibold">{loans.length}</p>
                </div>
                <div className="rounded-2xl bg-secondary/60 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Avance medio</p>
                  <p className="mt-1.5 text-xl font-semibold">{formatPercent(averageProgress)}</p>
                </div>
                <div className="rounded-2xl bg-secondary/60 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Préstamo activo</p>
                  <p className="mt-1.5 text-sm font-semibold">{activeLoan?.name ?? "Selecciona uno"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loansQuery.isPending && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Cargando préstamos...</CardContent>
        </Card>
      )}
      {loansQuery.isError && (
        <Card>
          <CardContent className="p-6 text-sm text-danger">{loansQuery.error.message}</CardContent>
        </Card>
      )}
      {loansQuery.data && loans.length === 0 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Empieza a seguir tus préstamos</CardTitle>
            <CardDescription>
              Crea tu primer préstamo para ver cuota mensual, pendiente, progreso e historial de pagos en un solo lugar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setSelectedLoan(null);
                setLoanDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Crear préstamo
            </Button>
          </CardContent>
        </Card>
      )}

      {loans.length > 0 && (
        <>
          <LoanSummaryCards loans={loans} />
          <div className="grid gap-6 xl:grid-cols-1">
            {activeLoan && (
              <LoanDetailPanel
                loan={activeLoan}
                onEdit={() => {
                  setSelectedLoan(activeLoan);
                  setLoanDialogOpen(true);
                }}
                onAddPayment={() => {
                  setSelectedLoan(activeLoan);
                  setSelectedPayment(null);
                  setPaymentDialogOpen(true);
                }}
              />
            )}
            <LoanList
              loans={loans}
              activeLoanId={activeLoan?.id}
              onSelect={setActiveLoanId}
              onEdit={(loan) => {
                setActiveLoanId(loan.id);
                setSelectedLoan(loan);
                setLoanDialogOpen(true);
              }}
              onAddPayment={(loan) => {
                setActiveLoanId(loan.id);
                setSelectedLoan(loan);
                setSelectedPayment(null);
                setPaymentDialogOpen(true);
              }}
              onDelete={(loan) => deleteLoanMutation.mutate(loan)}
            />
          </div>
          {activeLoan && (
            <>
              {paymentsQuery.isPending && (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    Cargando historial de pagos...
                  </CardContent>
                </Card>
              )}
              {paymentsQuery.isError && (
                <Card>
                  <CardContent className="p-6 text-sm text-danger">{paymentsQuery.error.message}</CardContent>
                </Card>
              )}
              {paymentsQuery.data && (
                <LoanPaymentHistory
                  payments={payments}
                  onEdit={(payment) => {
                    setSelectedLoan(activeLoan);
                    setSelectedPayment(payment);
                    setPaymentDialogOpen(true);
                  }}
                  onDelete={(payment) => deletePaymentMutation.mutate(payment)}
                />
              )}
            </>
          )}
        </>
      )}

      <LoanFormDialog
        open={loanDialogOpen}
        loan={selectedLoan}
        onOpenChange={(nextOpen) => {
          setLoanDialogOpen(nextOpen);
          if (!nextOpen) setSelectedLoan(null);
        }}
        onSubmit={async (values) => {
          await loanMutation.mutateAsync(values);
        }}
      />
      <LoanPaymentDialog
        open={paymentDialogOpen}
        loan={selectedLoan ?? activeLoan}
        payment={selectedPayment}
        existingPayments={selectedLoan?.id === activeLoan?.id ? payments : []}
        onOpenChange={(nextOpen) => {
          setPaymentDialogOpen(nextOpen);
          if (!nextOpen) setSelectedPayment(null);
        }}
        onSubmit={async (values) => {
          await paymentMutation.mutateAsync(values);
        }}
      />
    </section>
  );
}
