import {
  LoanFormValues,
  LoanListResponse,
  LoanPaymentFormValues,
  LoanPaymentListResponse,
  LoanPaymentResponse,
  LoanResponse,
} from "@/types/api";
import { apiRequest } from "@/services/http";

export function fetchLoans() {
  return apiRequest<LoanListResponse>("/loans");
}

export function createLoan(payload: LoanFormValues) {
  return apiRequest<LoanResponse>("/loans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLoan(id: string, payload: LoanFormValues) {
  return apiRequest<LoanResponse>(`/loans/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteLoan(id: string) {
  return apiRequest<void>(`/loans/${id}`, { method: "DELETE" });
}

export function fetchLoanPayments(loanId: string) {
  return apiRequest<LoanPaymentListResponse>(`/loans/${loanId}/payments`);
}

export function createLoanPayment(loanId: string, payload: LoanPaymentFormValues) {
  return apiRequest<LoanPaymentResponse>(`/loans/${loanId}/payments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLoanPayment(loanId: string, paymentId: string, payload: LoanPaymentFormValues) {
  return apiRequest<LoanPaymentResponse>(`/loans/${loanId}/payments/${paymentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteLoanPayment(loanId: string, paymentId: string) {
  return apiRequest<void>(`/loans/${loanId}/payments/${paymentId}`, { method: "DELETE" });
}
