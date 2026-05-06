import cors from "cors";
import express from "express";
import { getDatabaseStatus } from "./config/db.js";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { bankAccountRouter } from "./routes/bank-account.routes.js";
import { investmentRouter } from "./routes/investment.routes.js";
import { loanRouter } from "./routes/loan.routes.js";
import { summaryRouter } from "./routes/summary.routes.js";
import { transactionRouter } from "./routes/transaction.routes.js";

export const app = express();

const allowedOrigins = new Set([env.CLIENT_URL, ...env.CLIENT_URLS].map((value) => value.replace(/\/$/, "")));
const allowedOriginPatterns = env.CLIENT_URL_PATTERNS.map((pattern) => {
  const escapedPattern = pattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*");

  return new RegExp(`^${escapedPattern}$`);
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, "");
      const matchesPattern = allowedOriginPatterns.some((pattern) => pattern.test(normalizedOrigin));

      if (allowedOrigins.has(normalizedOrigin) || matchesPattern) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok", database: getDatabaseStatus() });
});

app.get("/ready", (_request, response) => {
  const database = getDatabaseStatus();
  response.status(database === "connected" ? 200 : 503).json({ status: database === "connected" ? "ready" : "degraded", database });
});

app.use("/api/auth", authRouter);
app.use("/api/bank-accounts", bankAccountRouter);
app.use("/api/investments", investmentRouter);
app.use("/api/loans", loanRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/summary", summaryRouter);
app.use(errorMiddleware);
