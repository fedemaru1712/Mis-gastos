import { z } from "zod";
import { monthStringSchema } from "./auth.js";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const bankAccountSchema = z.object({
  bankName: z.string().trim().min(2, "Bank is required").max(80),
  accountName: z.string().trim().min(2, "Account name is required").max(80),
  openingBalance: z.number().min(0, "Opening balance must be greater than or equal to 0"),
  currency: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase()),
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

export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export type InvestmentInput = z.infer<typeof investmentSchema>;
