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
          <CardTitle>Listado de préstamos</CardTitle>
          <CardDescription>
            Consulta el estado de cada préstamo y entra en su detalle para gestionar pagos.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                  "w-full rounded-3xl bg-secondary/35 p-4 text-left transition hover:bg-secondary/45",
                  isActive && "bg-secondary/55",
                )}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-card text-primary">
                          <Landmark className="h-5 w-5" />
                        </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-lg font-semibold">{loan.name}</p>
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
                        <p className="mt-1 text-sm text-muted-foreground">
                          Cuota habitual {formatCurrency(loan.monthlyPayment)} · Día {loan.paymentDay}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Inicial</p>
                        <p className="mt-1 font-semibold">{formatCurrency(loan.initialAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Pendiente</p>
                        <p className="mt-1 font-semibold">{formatCurrency(loan.remainingAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Pagado</p>
                        <p className="mt-1 font-semibold">{formatCurrency(loan.totalPaid)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Pagos</p>
                        <p className="mt-1 font-semibold">{loan.paymentsCount}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Amortizado</p>
                        <p className="mt-1 font-semibold">{formatPercent(loan.progressPercentage)}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progreso del préstamo</span>
                        <span>{formatPercent(loan.progressPercentage)}</span>
                      </div>
                      <Progress
                        value={loan.progressPercentage}
                         indicatorClassName={loan.status === "paid" ? "bg-emerald-300" : undefined}
                       />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    <Button
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddPayment(loan);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Pago
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(loan);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(loan);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
