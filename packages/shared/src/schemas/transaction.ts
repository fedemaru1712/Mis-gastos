import { z } from "zod";
import { allCategories } from "../constants/categories.js";
import { objectIdSchema } from "./finance.js";

export const transactionTypeSchema = z.enum(["income", "expense"]);

export const transactionSchema = z.object({
  bankAccountId: objectIdSchema.optional().or(z.literal("")),
  type: transactionTypeSchema,
  amount: z.number().min(0, "Amount must be greater than or equal to 0"),
  category: z
    .string()
    .min(1, "Category is required")
    .refine((value) => allCategories.includes(value as (typeof allCategories)[number]), {
      message: "Category is not allowed",
    }),
  description: z.string().trim().max(160).optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
});

export const transactionFiltersSchema = z.object({
  type: transactionTypeSchema.or(z.literal("all")).optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month must use YYYY-MM format")
    .optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
