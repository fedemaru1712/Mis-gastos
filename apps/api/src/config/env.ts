import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function normalizeUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

function parseCsvEnv(name: string) {
  return (process.env[name] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseAllowedOrigins() {
  const values = [process.env.CLIENT_URL, ...parseCsvEnv("CLIENT_URLS")]
    .filter((value): value is string => Boolean(value))
    .map((value) => normalizeUrl(value))
    .filter(Boolean);

  return [...new Set(values)];
}

function parseAllowedOriginPatterns() {
  return [...new Set(parseCsvEnv("CLIENT_URL_PATTERNS").map((value) => normalizeUrl(value)))];
}

const allowedOrigins = parseAllowedOrigins();
const allowedOriginPatterns = parseAllowedOriginPatterns();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL").transform(normalizeUrl),
  CLIENT_URLS: z.array(z.string().url("Each CLIENT_URLS value must be a valid URL")).default([]),
  CLIENT_URL_PATTERNS: z.array(z.string().min(1, "Each CLIENT_URL_PATTERNS value is required")).default([]),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse({
  ...process.env,
  CLIENT_URL: process.env.CLIENT_URL,
  CLIENT_URLS: allowedOrigins,
  CLIENT_URL_PATTERNS: allowedOriginPatterns,
});
