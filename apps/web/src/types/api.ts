import {
  AnnualSummary,
  BankAccount,
  InvestmentInput,
  InvestmentPosition,
  Loan,
  LoanInput,
  LoanPayment,
  LoanPaymentInput,
  MonthlySummary,
  BankAccountInput,
  TransactionFilters,
  TransactionInput,
  TransactionItem,
  UserProfile,
} from "@/domain";

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

export interface LoanListResponse {
  items: Loan[];
}

export interface LoanResponse {
  item: Loan;
}

export interface LoanPaymentListResponse {
  items: LoanPayment[];
}

export interface LoanPaymentResponse {
  item: LoanPayment;
}

export type TransactionFormValues = TransactionInput;
export type TransactionQuery = TransactionFilters;
export type SummaryResponse = MonthlySummary;
export type AnnualSummaryResponse = AnnualSummary;
export type BankAccountFormValues = BankAccountInput;
export type InvestmentFormValues = InvestmentInput;
export type LoanFormValues = LoanInput;
export type LoanPaymentFormValues = LoanPaymentInput;
