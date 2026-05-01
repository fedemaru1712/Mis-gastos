import {
  AnnualSummary,
  BankAccount,
  InvestmentInput,
  InvestmentPosition,
  MonthlySummary,
  BankAccountInput,
  TransactionFilters,
  TransactionInput,
  TransactionItem,
  UserProfile,
} from "@personal-finance/shared";

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserResponse {
  user: UserProfile;
}

export interface TransactionListResponse {
  items: TransactionItem[];
}

export interface TransactionResponse {
  item: TransactionItem;
}

export interface BankAccountListResponse {
  items: BankAccount[];
}

export interface BankAccountResponse {
  item: BankAccount;
}

export interface InvestmentListResponse {
  items: InvestmentPosition[];
}

export interface InvestmentResponse {
  item: InvestmentPosition;
}

export type TransactionFormValues = TransactionInput;
export type TransactionQuery = TransactionFilters;
export type SummaryResponse = MonthlySummary;
export type AnnualSummaryResponse = AnnualSummary;
export type BankAccountFormValues = BankAccountInput;
export type InvestmentFormValues = InvestmentInput;
