import { apiRequest } from "@/services/http";
import { BankAccountFormValues, BankAccountListResponse, BankAccountResponse } from "@/types/api";

export function fetchBankAccounts() {
  return apiRequest<BankAccountListResponse>("/bank-accounts");
}

export function createBankAccount(payload: BankAccountFormValues) {
  return apiRequest<BankAccountResponse>("/bank-accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBankAccount(id: string, payload: BankAccountFormValues) {
  return apiRequest<BankAccountResponse>(`/bank-accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteBankAccount(id: string) {
  return apiRequest<void>(`/bank-accounts/${id}`, { method: "DELETE" });
}
