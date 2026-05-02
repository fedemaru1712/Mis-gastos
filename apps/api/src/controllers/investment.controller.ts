import { Response } from "express";
import { investmentSchema, objectIdSchema } from "@personal-finance/shared";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { Investment } from "../models/Investment.js";
import { validateWithSchema } from "../utils/validators.js";

function serialize(investment: any) {
  const sortedEntries = [...investment.monthlyEntries].sort((left, right) => left.month.localeCompare(right.month));
  let cumulativeContributed = 0;
  const monthlyEntries = sortedEntries.map((entry) => {
    cumulativeContributed += entry.contribution;
    const profitabilityAmount = entry.endOfMonthValue - cumulativeContributed;
    const profitabilityPercentage = cumulativeContributed > 0 ? (profitabilityAmount / cumulativeContributed) * 100 : 0;

    return {
      month: entry.month,
      contribution: entry.contribution,
      endOfMonthValue: entry.endOfMonthValue,
      totalInvested: cumulativeContributed,
      profitabilityAmount,
      profitabilityPercentage,
    };
  });

  const totalContributed = monthlyEntries.at(-1)?.totalInvested ?? 0;
  const currentValue = monthlyEntries.at(-1)?.endOfMonthValue ?? 0;
  const profitabilityAmount = currentValue - totalContributed;
  const profitabilityPercentage = totalContributed > 0 ? (profitabilityAmount / totalContributed) * 100 : 0;

  return {
    id: investment._id.toString(),
    userId: investment.userId.toString(),
    name: investment.name,
    type: investment.type,
    symbol: investment.symbol,
    platform: investment.platform,
    monthlyEntries,
    totalContributed,
    currentValue,
    profitabilityAmount,
    profitabilityPercentage,
    createdAt: investment.createdAt.toISOString(),
    updatedAt: investment.updatedAt.toISOString(),
  };
}

function routeId(request: AuthenticatedRequest) {
  return validateWithSchema(objectIdSchema, request.params.id);
}

export async function listInvestments(request: AuthenticatedRequest, response: Response) {
  const items = await Investment.find({ userId: request.auth?.userId }).sort({ updatedAt: -1, createdAt: -1 });
  return response.json({ items: items.map(serialize) });
}

export async function createInvestment(request: AuthenticatedRequest, response: Response) {
  const payload = validateWithSchema(investmentSchema, request.body);
  const existingPlan = await Investment.exists({ userId: request.auth?.userId });
  if (existingPlan) {
    return response.status(409).json({ message: "Solo puedes tener un plan de inversión" });
  }
  const item = await Investment.create({
    ...payload,
    symbol: payload.symbol || undefined,
    platform: payload.platform || undefined,
    userId: request.auth?.userId,
  });
  return response.status(201).json({ item: serialize(item) });
}

export async function updateInvestment(request: AuthenticatedRequest, response: Response) {
  const payload = validateWithSchema(investmentSchema, request.body);
  const item = await Investment.findOneAndUpdate(
    { _id: routeId(request), userId: request.auth?.userId },
    {
      ...payload,
      symbol: payload.symbol || undefined,
      platform: payload.platform || undefined,
      monthlyEntries: [...payload.monthlyEntries].sort((left, right) => left.month.localeCompare(right.month)),
    },
    { new: true },
  );
  if (!item) return response.status(404).json({ message: "Investment not found" });
  return response.json({ item: serialize(item) });
}

export async function deleteInvestment(request: AuthenticatedRequest, response: Response) {
  const item = await Investment.findOneAndDelete({ _id: routeId(request), userId: request.auth?.userId });
  if (!item) return response.status(404).json({ message: "Investment not found" });
  return response.status(204).send();
}
