import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function normalizeUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

function parseAllowedOrigins() {
  const values = [process.env.CLIENT_URL, process.env.CLIENT_URLS]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(","))
    .map((value) => normalizeUrl(value))
    .filter(Boolean);

  return [...new Set(values)];
}

const allowedOrigins = parseAllowedOrigins();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL").transform(normalizeUrl),
  CLIENT_URLS: z.array(z.string().url("Each CLIENT_URLS value must be a valid URL")).default([]),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse({
  ...process.env,
  CLIENT_URL: process.env.CLIENT_URL,
  CLIENT_URLS: allowedOrigins,
});
