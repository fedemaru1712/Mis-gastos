import { Request, Response } from "express";
import { getPaymentMonthFromDate, objectIdSchema, transactionFiltersSchema, transactionSchema } from "../domain/index.js";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { BankAccount } from "../models/BankAccount.js";
import { LoanPayment } from "../models/LoanPayment.js";
import { Transaction } from "../models/Transaction.js";
import { findOwnedLoanById, removeLoanPaymentByExpenseId, syncLoanPaymentWithExpense } from "./loan.controller.js";
import { HttpError } from "../utils/http-error.js";
import { validateWithSchema } from "../utils/validators.js";

function serialize(transaction: any) {
  return {
    id: transaction._id.toString(),
    userId: transaction.userId.toString(),
    bankAccountId: transaction.bankAccountId?.toString(),
    loanId: transaction.loanId?.toString(),
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

function toHttpError(error: unknown) {
  if (error instanceof HttpError) return error;
  if (error instanceof Error) return new HttpError(409, error.message);
  return new HttpError(500, "Unexpected error");
}

function buildTransactionUpdatePayload(payload: {
  bankAccountId?: string;
  loanId?: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date: string;
}) {
  return {
    ...payload,
    bankAccountId: payload.bankAccountId || undefined,
    loanId: payload.loanId || undefined,
    description: payload.description || undefined,
    date: new Date(payload.date),
  };
}

async function assertBankAccountBelongsToUser(bankAccountId: string | undefined, userId: string | undefined) {
  if (!bankAccountId) return;

  const accountExists = await BankAccount.exists({ _id: bankAccountId, userId });
  if (!accountExists) {
    throw new HttpError(400, "Bank account is not valid for this user");
  }
}

async function assertLoanBelongsToUser(loanId: string | undefined, userId: string | undefined) {
  if (!loanId) return;

  const loanExists = await findOwnedLoanById(userId, loanId);
  if (!loanExists) {
    throw new HttpError(400, "Loan is not valid for this user");
  }
}

async function assertLoanRepaymentMonthAvailable({
  userId,
  loanId,
  expenseId,
  date,
}: {
  userId: string | undefined;
  loanId?: string;
  expenseId?: string;
  date: string;
}) {
  if (!loanId) return;

  const paymentMonth = getPaymentMonthFromDate(date);
  const conflict = await LoanPayment.findOne({
    ...(userId ? { userId } : {}),
    loanId,
    paymentMonth,
    ...(expenseId ? { expenseId: { $ne: new Types.ObjectId(expenseId) } } : {}),
  });

  if (conflict) {
    throw new HttpError(409, "A payment already exists for this loan and month.");
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
  await assertLoanBelongsToUser(payload.loanId || undefined, request.auth?.userId);
  await assertLoanRepaymentMonthAvailable({
    userId: request.auth?.userId,
    loanId: payload.loanId || undefined,
    date: payload.date,
  });

  let created: any;
  try {
    created = await Transaction.create({
      ...buildTransactionUpdatePayload(payload),
      userId: request.auth?.userId,
    });
    await syncLoanPaymentWithExpense({ userId: request.auth?.userId, expense: created });
  } catch (error) {
    if (created?._id) {
      await Transaction.deleteOne({ _id: created._id, userId: request.auth?.userId });
    }
    throw toHttpError(error);
  }

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
  const transactionId = routeId(request);
  const previousItem = await Transaction.findOne({ _id: transactionId, userId: request.auth?.userId });
  if (!previousItem) {
    return response.status(404).json({ message: "Transaction not found" });
  }

  const payload = validateWithSchema(transactionSchema, request.body);
  await assertBankAccountBelongsToUser(payload.bankAccountId || undefined, request.auth?.userId);
  await assertLoanBelongsToUser(payload.loanId || undefined, request.auth?.userId);
  await assertLoanRepaymentMonthAvailable({
    userId: request.auth?.userId,
    loanId: payload.loanId || undefined,
    expenseId: transactionId,
    date: payload.date,
  });

  const updatePayload = buildTransactionUpdatePayload(payload);
  const rollbackPayload = {
    bankAccountId: previousItem.bankAccountId?.toString(),
    loanId: previousItem.loanId?.toString(),
    type: previousItem.type,
    amount: previousItem.amount,
    category: previousItem.category,
    description: previousItem.description ?? undefined,
    date: previousItem.date.toISOString().slice(0, 10),
  } as const;

  const item = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId: request.auth?.userId },
    updatePayload,
    { new: true },
  );
  if (!item) {
    return response.status(404).json({ message: "Transaction not found" });
  }

  try {
    await syncLoanPaymentWithExpense({ userId: request.auth?.userId, expense: item });
  } catch (error) {
    await Transaction.updateOne({ _id: transactionId, userId: request.auth?.userId }, buildTransactionUpdatePayload(rollbackPayload));
    throw toHttpError(error);
  }

  return response.json({ item: serialize(item) });
}

export async function deleteTransaction(request: AuthenticatedRequest, response: Response) {
  const transactionId = routeId(request).toString();
  const item = await Transaction.findOneAndDelete({ _id: transactionId, userId: request.auth?.userId });
  if (!item) {
    return response.status(404).json({ message: "Transaction not found" });
  }
  await removeLoanPaymentByExpenseId({ userId: request.auth?.userId, expenseId: transactionId });
  return response.status(204).send();
}
