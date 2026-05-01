import { Router } from "express";
import {
  createInvestment,
  deleteInvestment,
  listInvestments,
  updateInvestment,
} from "../controllers/investment.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const investmentRouter = Router();

investmentRouter.use(requireAuth);
investmentRouter.get("/", listInvestments);
investmentRouter.post("/", createInvestment);
investmentRouter.put("/:id", updateInvestment);
investmentRouter.delete("/:id", deleteInvestment);
