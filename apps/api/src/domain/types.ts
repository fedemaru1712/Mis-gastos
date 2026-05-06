export type TransactionType = "income" | "expense";
export type InvestmentType = "stock" | "crypto" | "fund" | "etf" | "bond" | "other";
export type LoanStatus = "active" | "paid";

export interface UserProfile {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
