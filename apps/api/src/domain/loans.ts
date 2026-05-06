import type { LoanStatus } from "./types.js";

interface LoanPaymentAmount {
  amount: number;
}

interface CalculateLoanMetricsInput {
  initialAmount: number;
  payments?: LoanPaymentAmount[];
}

function safeAmount(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function isMonthString(value?: string | null) {
  return Boolean(value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value));
}

export function getPaymentMonthFromDate(value: string) {
  return value.slice(0, 7);
}

export function normalizePaymentMonth(value: string) {
  const normalizedValue = value.trim();
  return isMonthString(normalizedValue) ? normalizedValue : "";
}

export function calculateLoanMetrics({ initialAmount, payments = [] }: CalculateLoanMetricsInput) {
  const normalizedInitialAmount = safeAmount(initialAmount);
  const trackedPaymentsTotal = payments.reduce((sum, payment) => sum + safeAmount(payment.amount), 0);
  const totalPaid = trackedPaymentsTotal;
  const remainingAmount = Math.max(normalizedInitialAmount - totalPaid, 0);
  const progressPercentage = normalizedInitialAmount > 0 ? Math.min((totalPaid / normalizedInitialAmount) * 100, 100) : 0;
  const status: LoanStatus = remainingAmount <= 0 ? "paid" : "active";

  return {
    totalPaid,
    remainingAmount,
    progressPercentage,
    status,
  };
}
