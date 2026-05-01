import { Router } from "express";
import {
  createBankAccount,
  deleteBankAccount,
  listBankAccounts,
  updateBankAccount,
} from "../controllers/bank-account.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const bankAccountRouter = Router();

bankAccountRouter.use(requireAuth);
bankAccountRouter.get("/", listBankAccounts);
bankAccountRouter.post("/", createBankAccount);
bankAccountRouter.put("/:id", updateBankAccount);
bankAccountRouter.delete("/:id", deleteBankAccount);
