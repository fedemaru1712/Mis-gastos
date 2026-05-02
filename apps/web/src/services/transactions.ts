import { apiRequest } from "@/services/http";
import { TransactionListResponse, TransactionQuery, TransactionResponse, TransactionFormValues } from "@/types/api";

export function fetchTransactions(query: TransactionQuery) {
  const params = new URLSearchParams();
  if (query.type) params.set("type", query.type);
  if (query.category) params.set("category", query.category);
  if (query.month) params.set("month", query.month);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<TransactionListResponse>(`/transactions${suffix}`);
}

export function createTransaction(payload: TransactionFormValues) {
  return apiRequest<TransactionResponse>("/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTransaction(id: string, payload: TransactionFormValues) {
  return apiRequest<TransactionResponse>(`/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTransaction(id: string) {
  return apiRequest<void>(`/transactions/${id}`, { method: "DELETE" });
}
