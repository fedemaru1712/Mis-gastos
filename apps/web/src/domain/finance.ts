import { z } from "zod";
import { monthStringSchema } from "./auth";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

export const bankAccountSchema = z.object({
  bankName: z.string().trim().min(2, "Bank is required").max(80),
  accountName: z.string().trim().min(2, "Account name is required").max(80),
  openingBalance: z.number().min(0, "Opening balance must be greater than or equal to 0"),
  currency: z.string().trim().min(3).max(3).transform((value) => value.toUpperCase()),
});

export const investmentTypeSchema = z.enum(["stock", "crypto", "fund", "etf", "bond", "other"]);

export const investmentMonthlyEntrySchema = z.object({
  month: monthStringSchema,
  contribution: z.number().min(0, "Contribution must be greater than or equal to 0"),
  endOfMonthValue: z.number().min(0, "End of month value must be greater than or equal to 0"),
});

export const investmentSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  type: investmentTypeSchema,
  symbol: z.string().trim().max(20).optional().or(z.literal("")),
  platform: z.string().trim().max(80).optional().or(z.literal("")),
  monthlyEntries: z.array(investmentMonthlyEntrySchema),
});

export const loanStatusSchema = z.enum(["active", "paid"]);

export const loanSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  initialAmount: z.number().positive("Loan amount must be greater than 0"),
  monthlyPayment: z.number().positive("Monthly payment must be greater than 0"),
  paymentDay: z.number().int().min(1, "Payment day must be between 1 and 31").max(31, "Payment day must be between 1 and 31"),
  startDate: dateStringSchema,
});

export const loanPaymentSchema = z.object({
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentMonth: monthStringSchema,
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export type InvestmentInput = z.infer<typeof investmentSchema>;
export type LoanInput = z.infer<typeof loanSchema>;
export type LoanPaymentInput = z.infer<typeof loanPaymentSchema>;
