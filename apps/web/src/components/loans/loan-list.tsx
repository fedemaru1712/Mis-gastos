import type { Loan } from "@/domain";
import { Landmark, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  loans: Loan[];
  activeLoanId?: string | null;
  onSelect: (loanId: string) => void;
  onEdit: (loan: Loan) => void;
  onAddPayment: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
}

export function LoanList({ loans, activeLoanId, onSelect, onEdit, onAddPayment, onDelete }: Props) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Préstamos</CardTitle>
          <CardDescription>Selecciona un préstamo para ver su detalle y gestionar pagos.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loans.map((loan) => {
          const isActive = loan.id === activeLoanId;

          return (
            <div
              key={loan.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(loan.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(loan.id);
                }
              }}
              className={cn(
                "w-full rounded-2xl bg-white/[0.04] p-4 text-left transition-colors hover:bg-white/[0.06]",
                isActive && "bg-white/[0.07] ring-1 ring-white/[0.10]",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  <Landmark className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold">{loan.name}</p>
                      <Badge
                        className={
                          loan.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-amber-500/10 text-amber-200"
                        }
                      >
                        {loan.status === "paid" ? "Pagado" : "Activo"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Registrar pago"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddPayment(loan);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Editar préstamo"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(loan);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-danger"
                        title="Eliminar préstamo"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(loan);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Cuota {formatCurrency(loan.monthlyPayment)} · Día {loan.paymentDay}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(loan.totalPaid)} pagados</span>
                      <span>{formatPercent(loan.progressPercentage)}</span>
                    </div>
                    <Progress
                      value={loan.progressPercentage}
                      indicatorClassName={loan.status === "paid" ? "bg-emerald-400" : undefined}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(loan.remainingAmount)} pendientes de{" "}
                      {formatCurrency(loan.initialAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
