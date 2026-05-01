import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
} from "../controllers/transaction.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const transactionRouter = Router();

transactionRouter.use(requireAuth);
transactionRouter.get("/", listTransactions);
transactionRouter.post("/", createTransaction);
transactionRouter.get("/:id", getTransaction);
transactionRouter.put("/:id", updateTransaction);
transactionRouter.delete("/:id", deleteTransaction);
