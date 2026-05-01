import { Router } from "express";
import { getAnnualSummary, getMonthlySummary } from "../controllers/summary.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const summaryRouter = Router();

summaryRouter.use(requireAuth);
summaryRouter.get("/monthly", getMonthlySummary);
summaryRouter.get("/yearly", getAnnualSummary);
