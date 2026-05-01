import { apiRequest } from "@/services/http";
import { AnnualSummaryResponse, SummaryResponse } from "@/types/api";

export function fetchMonthlySummary(month: string) {
  return apiRequest<SummaryResponse>(`/summary/monthly?month=${month}`);
}

export function fetchAnnualSummary(year: string) {
  return apiRequest<AnnualSummaryResponse>(`/summary/yearly?year=${year}`);
}
