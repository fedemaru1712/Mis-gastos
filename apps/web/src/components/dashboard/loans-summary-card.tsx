import { Landmark, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Loan } from "@/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getLoansSummary } from "@/lib/loans";

interface Props {
  loans?: Loan[];
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function LoansSummaryCard({ loans, isLoading, errorMessage }: Props) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Préstamos</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando préstamos...</p>
        </CardContent>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card className="bg-card">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Préstamos</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-danger">{errorMessage}</p>
        </CardContent>
      </Card>
    );
  }

  if (!loans?.length) {
    return (
      <Card
        className="bg-card transition-colors hover:bg-card"
        role="button"
        tabIndex={0}
        onClick={() => navigate("/loans")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigate("/loans");
          }
        }}
      >
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Préstamos</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold">Sin préstamos</p>
              <p className="mt-1 text-xs text-muted-foreground">Añade tu primer préstamo para seguir el progreso.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <Progress value={0} />
        </CardContent>
      </Card>
    );
  }

  const summary = getLoansSummary(loans);

  return (
    <Card
        className="bg-card transition-colors hover:bg-card"
      role="button"
      tabIndex={0}
      onClick={() => navigate("/loans")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate("/loans");
        }
      }}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Préstamos</CardTitle>
        <Landmark className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 max-w-full flex-1 overflow-hidden">
            <p className="max-w-full overflow-hidden text-xl font-semibold leading-tight sm:text-2xl whitespace-nowrap">
              {formatCurrency(summary.totalPaid)} / {formatCurrency(summary.totalInitialAmount)}
            </p>
          </div>
        </div>
        <Progress
          value={summary.progressPercentage}
          className="h-6"
          label={formatPercent(summary.progressPercentage)}
          labelAlign="left"
          labelClassName="text-[11px] sm:text-xs"
        />
      </CardContent>
    </Card>
  );
}
