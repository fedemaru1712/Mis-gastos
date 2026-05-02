import { z } from "zod";

export const monthStringSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must use YYYY-MM format");

export const googleAuthSchema = z.object({
  credential: z.string().min(1, "Google credential is required"),
});

export const monthParamSchema = z.object({
  month: monthStringSchema.optional(),
});

export const yearParamSchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, "Year must use YYYY format")
    .optional(),
});
