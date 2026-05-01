import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { bankAccountRouter } from "./routes/bank-account.routes.js";
import { investmentRouter } from "./routes/investment.routes.js";
import { summaryRouter } from "./routes/summary.routes.js";
import { transactionRouter } from "./routes/transaction.routes.js";

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/bank-accounts", bankAccountRouter);
app.use("/api/investments", investmentRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/summary", summaryRouter);
app.use(errorMiddleware);
