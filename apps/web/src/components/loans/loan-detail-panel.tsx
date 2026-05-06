import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Loan } from "@/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <Card className="overflow-hidden border-border/80 bg-card/95">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl">{loan.name}</CardTitle>
            <Badge className={loan.status === "paid" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-300"}>
              {loan.status === "paid" ? "Pagado" : "Activo"}
            </Badge>
          </div>
          <CardDescription className="mt-2">
            Inicio {formatDate(loan.startDate)}{loan.lastPaymentMonth ? ` · Último pago ${formatMonth(loan.lastPaymentMonth)}` : " · Sin pagos registrados"}
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onEdit}>
            Editar préstamo
          </Button>
          <Button onClick={onAddPayment}>Registrar pago</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Cantidad inicial</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(loan.initialAmount)}</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total pagado</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(loan.totalPaid)}</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pendiente</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(loan.remainingAmount)}</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Cuota mensual</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Día de pago</p>
            <p className="mt-2 text-2xl font-semibold">{loan.paymentDay}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Progreso visual</p>
              <p className="text-sm text-muted-foreground">Porcentaje amortizado sobre la deuda inicial.</p>
            </div>
            <p className="text-2xl font-semibold">{formatPercent(loan.progressPercentage)}</p>
          </div>
          <Progress
            className="mt-4 h-3"
            value={loan.progressPercentage}
            indicatorClassName={loan.status === "paid" ? "bg-emerald-400" : undefined}
          />
        </div>
      </CardContent>
    </Card>
  );
}
