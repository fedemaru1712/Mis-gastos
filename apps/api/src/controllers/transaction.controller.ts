import { Request, Response } from "express";
import { objectIdSchema, transactionFiltersSchema, transactionSchema } from "@personal-finance/shared";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { BankAccount } from "../models/BankAccount.js";
import { Transaction } from "../models/Transaction.js";
import { HttpError } from "../utils/http-error.js";
import { validateWithSchema } from "../utils/validators.js";

function serialize(transaction: any) {
  return {
    id: transaction._id.toString(),
    userId: transaction.userId.toString(),
    bankAccountId: transaction.bankAccountId?.toString(),
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

function monthRange(month?: string) {
  if (!month) return null;
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { $gte: start, $lt: end };
}

function routeId(request: Request) {
  return validateWithSchema(objectIdSchema, request.params.id);
}

async function assertBankAccountBelongsToUser(bankAccountId: string | undefined, userId: string | undefined) {
  if (!bankAccountId) return;

  const accountExists = await BankAccount.exists({ _id: bankAccountId, userId });
  if (!accountExists) {
    throw new HttpError(400, "Bank account is not valid for this user");
  }
}

export async function listTransactions(request: AuthenticatedRequest, response: Response) {
  const filters = validateWithSchema(transactionFiltersSchema, request.query);
  const date = monthRange(filters.month);
  const query = {
    userId: new Types.ObjectId(request.auth?.userId),
    ...(filters.type && filters.type !== "all" ? { type: filters.type } : {}),
    ...(filters.category && filters.category !== "all" ? { category: filters.category } : {}),
    ...(date ? { date } : {}),
  };

  const items = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
  return response.json({ items: items.map(serialize) });
}

export async function createTransaction(request: AuthenticatedRequest, response: Response) {
  const payload = validateWithSchema(transactionSchema, request.body);
  await assertBankAccountBelongsToUser(payload.bankAccountId || undefined, request.auth?.userId);

  const created = await Transaction.create({
    ...payload,
    bankAccountId: payload.bankAccountId || undefined,
    description: payload.description || undefined,
    date: new Date(payload.date),
    userId: request.auth?.userId,
  });
  return response.status(201).json({ item: serialize(created) });
}

export async function getTransaction(request: AuthenticatedRequest, response: Response) {
  const item = await Transaction.findOne({ _id: routeId(request), userId: request.auth?.userId });
  if (!item) {
    return response.status(404).json({ message: "Transaction not found" });
  }
  return response.json({ item: serialize(item) });
}

export async function updateTransaction(request: AuthenticatedRequest, response: Response) {
  const payload = validateWithSchema(transactionSchema, request.body);
  await assertBankAccountBelongsToUser(payload.bankAccountId || undefined, request.auth?.userId);

  const item = await Transaction.findOneAndUpdate(
    { _id: routeId(request), userId: request.auth?.userId },
    {
      ...payload,
      bankAccountId: payload.bankAccountId || undefined,
      description: payload.description || undefined,
      date: new Date(payload.date),
    },
    { new: true },
  );
  if (!item) {
    return response.status(404).json({ message: "Transaction not found" });
  }
  return response.json({ item: serialize(item) });
}

export async function deleteTransaction(request: AuthenticatedRequest, response: Response) {
  const item = await Transaction.findOneAndDelete({ _id: routeId(request), userId: request.auth?.userId });
  if (!item) {
    return response.status(404).json({ message: "Transaction not found" });
  }
  return response.status(204).send();
}
