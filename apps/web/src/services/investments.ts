import { apiRequest } from "@/services/http";
import { InvestmentFormValues, InvestmentListResponse, InvestmentResponse } from "@/types/api";

export function fetchInvestments() {
  return apiRequest<InvestmentListResponse>("/investments");
}

export function createInvestment(payload: InvestmentFormValues) {
  return apiRequest<InvestmentResponse>("/investments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateInvestment(id: string, payload: InvestmentFormValues) {
  return apiRequest<InvestmentResponse>(`/investments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteInvestment(id: string) {
  return apiRequest<void>(`/investments/${id}`, { method: "DELETE" });
}
