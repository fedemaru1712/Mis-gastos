function normalizeNumber(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Object.is(value, -0) ? 0 : value;
}

export function formatNumber(value: number) {
  const normalized = normalizeNumber(value);
  const sign = normalized < 0 ? "-" : "";
  const absolute = Math.abs(normalized);
  const [integerPart, decimalPart] = absolute.toFixed(2).split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${sign}${groupedInteger},${decimalPart}`;
}

export function formatCurrency(value: number) {
  return `${formatNumber(value)} €`;
}

export function formatPercent(value: number) {
  return `${formatNumber(value)}%`;
}
