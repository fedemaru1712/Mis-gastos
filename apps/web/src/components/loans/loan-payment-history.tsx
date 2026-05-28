import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { LoanPayment } from "@/domain";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

interface Props {
  payments: LoanPayment[];
  onEdit: (payment: LoanPayment) => void;
  onDelete: (payment: LoanPayment) => void;
}

function formatPeriod(value: string) {
  return format(new Date(`${value}-01T00:00:00`), "MMMM yyyy", { locale: es });
}

export function LoanPaymentHistory({ payments, onEdit, onDelete }: Props) {
  const rows = payments.reduce<Array<{ payment: LoanPayment; runningPaid: number }>>((acc, payment) => {
    const prev = acc.at(-1)?.runningPaid ?? 0;
    return [...acc, { payment, runningPaid: prev + payment.amount }];
  }, []);

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Historial de pagos</CardTitle>
        <CardDescription>
          Edita o elimina pagos mensuales y el préstamo se recalculará automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.04] p-6 text-center text-sm text-muted-foreground">
            Todavía no hay pagos registrados para este préstamo.
          </div>
        ) : (
          <>
            {/* Mobile: TR-style divider rows */}
            <div className="divide-y divide-white/[0.05] md:hidden">
              {rows.map(({ payment, runningPaid }) => {
                const editable = !payment.expenseId;
                return (
                  <div key={payment.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium capitalize">{formatPeriod(payment.paymentMonth)}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.expenseId ? "Movimiento vinculado" : "Manual"}
                        {" · "}
                        Acum. {formatCurrency(runningPaid)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatCurrency(payment.amount)}
                    </p>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={!editable}
                        onClick={() => onEdit(payment)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-danger"
                        disabled={!editable}
                        onClick={() => onDelete(payment)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: clean table */}
            <div className="hidden overflow-hidden rounded-2xl bg-white/[0.03] md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/[0.04] hover:bg-white/[0.04]">
                    <TableHead>Mes</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead className="text-right">Total pagado</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ payment, runningPaid }) => {
                    const editable = !payment.expenseId;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="capitalize font-medium">
                          {formatPeriod(payment.paymentMonth)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.expenseId ? "Movimiento vinculado" : "Manual"}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatCurrency(runningPaid)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!editable}
                              onClick={() => onEdit(payment)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-danger"
                              disabled={!editable}
                              onClick={() => onDelete(payment)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
