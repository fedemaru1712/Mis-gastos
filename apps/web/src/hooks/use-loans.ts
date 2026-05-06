import { useQuery } from "@tanstack/react-query";
import { fetchLoanPayments, fetchLoans } from "@/services/loans";

export function useLoansQuery() {
  return useQuery({ queryKey: ["loans"], queryFn: fetchLoans });
}

export function useLoanPaymentsQuery(loanId?: string | null) {
  return useQuery({
    queryKey: ["loan-payments", loanId],
    queryFn: () => fetchLoanPayments(loanId as string),
    enabled: Boolean(loanId),
  });
}
