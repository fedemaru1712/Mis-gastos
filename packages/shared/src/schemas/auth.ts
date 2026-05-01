import { z } from "zod";

export const googleAuthSchema = z.object({
  credential: z.string().min(1, "Google credential is required"),
});

export const monthParamSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month must use YYYY-MM format")
    .optional(),
});

export const yearParamSchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, "Year must use YYYY format")
    .optional(),
});
