import type { InvestmentPosition } from "@/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";

function insightLabel(month?: string) {
  return month ? month : "Sin datos";
}

export function InvestmentInsightsGrid({
  entries,
  totalContributed,
}: {
  entries: InvestmentPosition["monthlyEntries"];
  totalContributed: number;
}) {
  const average =
    entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.profitabilityPercentage, 0) / entries.length : 0;
  const best = [...entries].sort((left, right) => right.profitabilityPercentage - left.profitabilityPercentage)[0];
  const worst = [...entries].sort((left, right) => left.profitabilityPercentage - right.profitabilityPercentage)[0];

  const cards = [
    {
      label: "Mejor mes",
      value: formatPercent(best?.profitabilityPercentage ?? 0),
      helper: insightLabel(best?.month),
    },
    {
      label: "Peor mes",
      value: formatPercent(worst?.profitabilityPercentage ?? 0),
      helper: insightLabel(worst?.month),
    },
    { label: "Media mensual", value: formatPercent(average), helper: `${entries.length} meses analizados` },
    {
      label: "Total aportado",
      value: formatCurrency(totalContributed),
      helper: "Capital acumulado",
    },
  ];

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
