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
  return format(new Date(`${value}-01T00:00:00`), "MMMM yyyy", {
    locale: es,
  });
}

export function LoanPaymentHistory({ payments, onEdit, onDelete }: Props) {
  const rows = payments.reduce<Array<{ payment: LoanPayment; runningPaid: number }>>((accumulator, payment) => {
    const previousTotal = accumulator.at(-1)?.runningPaid ?? 0;

    return [...accumulator, { payment, runningPaid: previousTotal + payment.amount }];
  }, []);

  return (
    <Card className="border-border/80 bg-card/95">
      <CardHeader>
        <CardTitle>Historial de pagos</CardTitle>
        <CardDescription>Edita o elimina pagos mensuales y el préstamo se recalculará automáticamente.</CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-6 text-sm text-muted-foreground">
            Todavía no hay pagos registrados para este préstamo.
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead className="text-right">Total pagado</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ payment, runningPaid }) => (
                    <TableRow key={payment.id}>
                      <TableCell className="capitalize">{formatPeriod(payment.paymentMonth)}</TableCell>
                      <TableCell>{payment.expenseId ? `Gasto ${payment.expenseId.slice(-6)}` : "Manual"}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(runningPaid)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" disabled={Boolean(payment.expenseId)} onClick={() => onEdit(payment)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-danger"
                            disabled={Boolean(payment.expenseId)}
                            onClick={() => onDelete(payment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="space-y-3 md:hidden">
              {rows.map(({ payment, runningPaid }) => (
                <div key={payment.id} className="rounded-xl border border-border/80 bg-secondary/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold capitalize">{formatPeriod(payment.paymentMonth)}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Total pagado</p>
                      <p className="mt-1 font-semibold">{formatCurrency(runningPaid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Origen</p>
                      <p className="mt-1 text-muted-foreground">
                        {payment.expenseId ? `Movimiento ${payment.expenseId.slice(-6)}` : "Manual"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" className="flex-1" disabled={Boolean(payment.expenseId)} onClick={() => onEdit(payment)}>
                      Editar
                    </Button>
                    <Button variant="danger" className="flex-1" disabled={Boolean(payment.expenseId)} onClick={() => onDelete(payment)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
