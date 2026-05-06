import { Router } from "express";
import {
  createLoan,
  createLoanPayment,
  deleteLoan,
  deleteLoanPayment,
  getLoan,
  listLoanPayments,
  listLoans,
  updateLoan,
  updateLoanPayment,
} from "../controllers/loan.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const loanRouter = Router();

loanRouter.use(requireAuth);
loanRouter.get("/", listLoans);
loanRouter.post("/", createLoan);
loanRouter.get("/:id", getLoan);
loanRouter.put("/:id", updateLoan);
loanRouter.delete("/:id", deleteLoan);
loanRouter.get("/:loanId/payments", listLoanPayments);
loanRouter.post("/:loanId/payments", createLoanPayment);
loanRouter.put("/:loanId/payments/:paymentId", updateLoanPayment);
loanRouter.delete("/:loanId/payments/:paymentId", deleteLoanPayment);
