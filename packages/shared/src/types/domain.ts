export type TransactionType = "income" | "expense";
export type InvestmentType = "stock" | "crypto" | "fund" | "etf" | "bond" | "other";

export interface UserProfile {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItem {
  id: string;
  userId: string;
  bankAccountId?: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountName: string;
  openingBalance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentPosition {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  symbol?: string;
  platform?: string;
  monthlyEntries: Array<{
    month: string;
    contribution: number;
    endOfMonthValue: number;
    totalInvested: number;
    profitabilityAmount: number;
    profitabilityPercentage: number;
  }>;
  totalContributed: number;
  currentValue: number;
  profitabilityAmount: number;
  profitabilityPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
  cashflow: Array<{
    date: string;
    day: string;
    income: number;
    expense: number;
  }>;
  recentTransactions: TransactionItem[];
  expenseByCategory: Array<{ category: string; total: number }>;
}

export interface AnnualSummary {
  year: string;
  openingBalance: number;
  income: number;
  expense: number;
  balance: number;
  months: Array<{
    month: string;
    label: string;
    income: number;
    expense: number;
    balance: number;
  }>;
}
