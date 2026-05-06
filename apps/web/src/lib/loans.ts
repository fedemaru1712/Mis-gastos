import type { Loan } from "@/domain";

export interface LoansSummary {
  totalInitialAmount: number;
  totalPaid: number;
  progressPercentage: number;
}

export function getLoansSummary(loans: Loan[]): LoansSummary {
  const totalInitialAmount = loans.reduce((sum, loan) => sum + loan.initialAmount, 0);
  const totalPaid = loans.reduce((sum, loan) => sum + loan.totalPaid, 0);
  const progressPercentage = totalInitialAmount > 0 ? (totalPaid / totalInitialAmount) * 100 : 0;

  return {
    totalInitialAmount,
    totalPaid,
    progressPercentage,
  };
}
