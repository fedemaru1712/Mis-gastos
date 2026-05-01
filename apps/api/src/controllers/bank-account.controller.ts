import { Response } from "express";
import { bankAccountSchema } from "@personal-finance/shared";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { BankAccount } from "../models/BankAccount.js";
import { validateWithSchema } from "../utils/validators.js";

function serialize(account: any) {
  return {
    id: account._id.toString(),
    userId: account.userId.toString(),
    bankName: account.bankName,
    accountName: account.accountName,
    currency: account.currency,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

export async function listBankAccounts(request: AuthenticatedRequest, response: Response) {
  const items = await BankAccount.find({ userId: request.auth?.userId }).sort({ bankName: 1, accountName: 1 });
  return response.json({ items: items.map(serialize) });
}

export async function createBankAccount(request: AuthenticatedRequest, response: Response) {
  const payload = validateWithSchema(bankAccountSchema, request.body);
  const item = await BankAccount.create({ ...payload, userId: request.auth?.userId });
  return response.status(201).json({ item: serialize(item) });
}

export async function updateBankAccount(request: AuthenticatedRequest, response: Response) {
  const payload = validateWithSchema(bankAccountSchema, request.body);
  const item = await BankAccount.findOneAndUpdate({ _id: request.params.id, userId: request.auth?.userId }, payload, {
    new: true,
  });
  if (!item) return response.status(404).json({ message: "Bank account not found" });
  return response.json({ item: serialize(item) });
}

export async function deleteBankAccount(request: AuthenticatedRequest, response: Response) {
  const item = await BankAccount.findOneAndDelete({ _id: request.params.id, userId: request.auth?.userId });
  if (!item) return response.status(404).json({ message: "Bank account not found" });
  return response.status(204).send();
}
