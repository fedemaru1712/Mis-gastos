import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Loan } from "@/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/format";

interface Props {
  loan: Loan;
  onEdit: () => void;
  onAddPayment: () => void;
}

function formatDate(value: string) {
  return format(new Date(`${value}T00:00:00`), "PPP", { locale: es });
}

function formatMonth(value: string) {
  return format(new Date(`${value}-01T00:00:00`), "MMMM yyyy", { locale: es });
}

export function LoanDetailPanel({ loan, onEdit, onAddPayment }: Props) {
  const paid = loan.status === "paid";

  return (
    <Card className="overflow-hidden bg-card">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Posición activa</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl">{loan.name}</CardTitle>
            <Badge className={paid ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-200"}>
              {paid ? "Pagado" : "Activo"}
            </Badge>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Inicio {formatDate(loan.startDate)}
            {loan.lastPaymentMonth
              ? ` · Último pago ${formatMonth(loan.lastPaymentMonth)}`
              : " · Sin pagos registrados"}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onEdit}>
            Editar préstamo
          </Button>
          <Button onClick={onAddPayment}>Registrar pago</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Cantidad inicial</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(loan.initialAmount)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Total pagado</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(loan.totalPaid)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Pendiente</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(loan.remainingAmount)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Cuota mensual</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Día de pago</p>
            <p className="mt-2 text-2xl font-semibold">{loan.paymentDay}</p>
          </div>
        </div>
        <div className="space-y-2 rounded-2xl bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Progreso</p>
            <p className="text-xl font-semibold">{formatPercent(loan.progressPercentage)}</p>
          </div>
          <Progress
            className="h-3"
            value={loan.progressPercentage}
            indicatorClassName={paid ? "bg-emerald-400" : undefined}
          />
          <p className="text-xs text-muted-foreground">Porcentaje amortizado sobre la deuda inicial</p>
        </div>
      </CardContent>
    </Card>
  );
}
