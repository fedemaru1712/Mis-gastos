import type { Loan } from "@/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";

export function LoanSummaryCards({ loans }: { loans: Loan[] }) {
  const activeLoans = loans.filter((loan) => loan.status === "active").length;
  const paidLoans = loans.filter((loan) => loan.status === "paid").length;
  const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
  const monthlyCommitment = loans.reduce(
    (sum, loan) => (loan.status === "active" ? sum + loan.monthlyPayment : sum),
    0,
  );
  const averageProgress = loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.progressPercentage, 0) / loans.length : 0;

  const cards = [
    { label: "Préstamos activos", value: String(activeLoans), helper: `${paidLoans} pagados` },
    { label: "Pendiente total", value: formatCurrency(totalRemaining), helper: "Capital por amortizar" },
    { label: "Cuotas mensuales", value: formatCurrency(monthlyCommitment), helper: "Suma de préstamos activos" },
    { label: "Progreso medio", value: formatPercent(averageProgress), helper: "Promedio amortizado" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
