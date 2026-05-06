import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Mis préstamos</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Gestiona tus préstamos personales, registra pagos mensuales y sigue el capital pendiente con cálculos
            automáticos.
          </p>
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
        <Card className="border-dashed border-border/80 bg-card/80">
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
