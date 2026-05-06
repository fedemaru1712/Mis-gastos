import { Response } from "express";
import {
  calculateLoanMetrics,
  getPaymentMonthFromDate,
  loanPaymentSchema,
  loanSchema,
  normalizePaymentMonth,
  objectIdSchema,
} from "../domain/index.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { Loan } from "../models/Loan.js";
import { LoanPayment } from "../models/LoanPayment.js";
import { HttpError } from "../utils/http-error.js";
import { validateWithSchema } from "../utils/validators.js";

function routeId(request: AuthenticatedRequest, key: string) {
  return validateWithSchema(objectIdSchema, request.params[key]);
}

function serializePayment(payment: any) {
  return {
    id: payment._id.toString(),
    loanId: payment.loanId.toString(),
    expenseId: payment.expenseId?.toString(),
    amount: payment.amount,
    paymentMonth: payment.paymentMonth,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

function serializeLoan(loan: any, payments: any[]) {
  const serializedPayments = payments.map(serializePayment).sort((left, right) => left.paymentMonth.localeCompare(right.paymentMonth));
  const metrics = calculateLoanMetrics({
    initialAmount: loan.initialAmount,
    payments: serializedPayments,
  });

  return {
    id: loan._id.toString(),
    userId: loan.userId.toString(),
    name: loan.name,
    initialAmount: loan.initialAmount,
    monthlyPayment: loan.monthlyPayment,
    paymentDay: loan.paymentDay,
    startDate: loan.startDate,
    status: metrics.status,
    totalPaid: metrics.totalPaid,
    remainingAmount: metrics.remainingAmount,
    progressPercentage: metrics.progressPercentage,
    paymentsCount: serializedPayments.length,
    lastPaymentMonth: serializedPayments.at(-1)?.paymentMonth,
    createdAt: loan.createdAt.toISOString(),
    updatedAt: loan.updatedAt.toISOString(),
  };
}

async function findOwnedLoan(request: AuthenticatedRequest, loanId: string) {
  return Loan.findOne({ _id: loanId, userId: request.auth?.userId });
}

export async function findOwnedLoanById(userId: string | undefined, loanId: string) {
  return Loan.findOne({ _id: loanId, userId });
}

async function touchLoan(loanId: string) {
  await Loan.updateOne({ _id: loanId }, { $set: { updatedAt: new Date() } }, { timestamps: false });
}

async function normalizeLegacyLoan(item: any) {
  if (item.initialPaidAmount == null && item.notes == null && item.paymentDay != null) return item;

  await Loan.updateOne(
    { _id: item._id },
    {
      $unset: { initialPaidAmount: 1, notes: 1 },
      $set: { paymentDay: item.paymentDay ?? (new Date(`${item.startDate}T00:00:00`).getDate() || 1) },
    },
  );
  return item;
}

async function findConflictingPayment({
  loanId,
  userId,
  paymentMonth,
  excludedPaymentId,
}: {
  loanId: string;
  userId?: string;
  paymentMonth: string;
  excludedPaymentId?: string;
}) {
  return LoanPayment.findOne({
    loanId,
    ...(userId ? { userId } : {}),
    paymentMonth: normalizePaymentMonth(paymentMonth),
    ...(excludedPaymentId ? { _id: { $ne: excludedPaymentId } } : {}),
  });
}

export async function syncLoanPaymentWithExpense({
  userId,
  expense,
}: {
  userId: string | undefined;
  expense: any;
}) {
  const expenseId = expense._id.toString();
  const existingPayment = await LoanPayment.findOne({ ...(userId ? { userId } : {}), expenseId });

  if (!expense.loanId || expense.type !== "expense") {
    if (existingPayment) {
      const previousLoanId = existingPayment.loanId.toString();
      await LoanPayment.deleteOne({ _id: existingPayment._id });
      await touchLoan(previousLoanId);
    }
    return;
  }

  const loan = await findOwnedLoanById(userId, expense.loanId.toString());
  if (!loan) return;

  const paymentMonth = getPaymentMonthFromDate(expense.date.toISOString().slice(0, 10));
  const conflictingPayment = await findConflictingPayment({
    loanId: loan._id.toString(),
    userId,
    paymentMonth,
    excludedPaymentId: existingPayment?._id?.toString(),
  });
  if (conflictingPayment) {
    throw new HttpError(409, "A payment already exists for this loan and month.");
  }

  if (!existingPayment) {
    await LoanPayment.create({
      userId,
      loanId: loan._id,
      expenseId: expense._id,
      amount: expense.amount,
      paymentMonth,
    });
    await touchLoan(loan._id.toString());
    return;
  }

  const previousLoanId = existingPayment.loanId.toString();
  await LoanPayment.updateOne(
    { _id: existingPayment._id },
    {
      $set: {
        loanId: loan._id,
        expenseId: expense._id,
        amount: expense.amount,
        paymentMonth,
      },
    },
  );
  await Promise.all([touchLoan(previousLoanId), touchLoan(loan._id.toString())]);
}

export async function removeLoanPaymentByExpenseId({ userId, expenseId }: { userId: string | undefined; expenseId: string }) {
  const existingPayment = await LoanPayment.findOneAndDelete({ ...(userId ? { userId } : {}), expenseId });
  if (existingPayment) {
    await touchLoan(existingPayment.loanId.toString());
  }
}

export async function listLoans(request: AuthenticatedRequest, response: Response) {
  const items = await Loan.find({ userId: request.auth?.userId }).sort({ updatedAt: -1, createdAt: -1 });
  await Promise.all(items.map(normalizeLegacyLoan));
  const loanIds = items.map((item) => item._id);
  const payments =
    loanIds.length > 0
      ? await LoanPayment.find({ userId: request.auth?.userId, loanId: { $in: loanIds } }).sort({
          paymentMonth: 1,
          createdAt: 1,
        })
      : [];

  const paymentsByLoan = new Map<string, any[]>();

  for (const payment of payments) {
    const key = payment.loanId.toString();
    const current = paymentsByLoan.get(key) ?? [];
    current.push(payment);
    paymentsByLoan.set(key, current);
  }

  return response.json({ items: items.map((item) => serializeLoan(item, paymentsByLoan.get(item._id.toString()) ?? [])) });
}

export async function getLoan(request: AuthenticatedRequest, response: Response) {
  const loan = await findOwnedLoan(request, routeId(request, "id"));
  if (!loan) return response.status(404).json({ message: "Préstamo no encontrado" });
  await normalizeLegacyLoan(loan);

  const payments = await LoanPayment.find({ userId: request.auth?.userId, loanId: loan._id }).sort({
    paymentMonth: 1,
    createdAt: 1,
  });

  return response.json({ item: serializeLoan(loan, payments) });
}

export async function createLoan(request: AuthenticatedRequest, response: Response) {
  const payload = validateWithSchema(loanSchema, request.body);
  const item = await Loan.create({
    ...payload,
    userId: request.auth?.userId,
  });
  return response.status(201).json({ item: serializeLoan(item, []) });
}

export async function updateLoan(request: AuthenticatedRequest, response: Response) {
  const payload = validateWithSchema(loanSchema, request.body);
  const item = await Loan.findOneAndUpdate(
    { _id: routeId(request, "id"), userId: request.auth?.userId },
    { ...payload, $unset: { initialPaidAmount: 1, notes: 1 } },
    { new: true },
  );
  if (!item) return response.status(404).json({ message: "Préstamo no encontrado" });
  await normalizeLegacyLoan(item);

  const payments = await LoanPayment.find({ userId: request.auth?.userId, loanId: item._id }).sort({
    paymentMonth: 1,
    createdAt: 1,
  });

  return response.json({ item: serializeLoan(item, payments) });
}

export async function deleteLoan(request: AuthenticatedRequest, response: Response) {
  const loanId = routeId(request, "id");
  const item = await Loan.findOneAndDelete({ _id: loanId, userId: request.auth?.userId });
  if (!item) return response.status(404).json({ message: "Préstamo no encontrado" });

  await LoanPayment.deleteMany({ userId: request.auth?.userId, loanId });
  return response.status(204).send();
}

export async function listLoanPayments(request: AuthenticatedRequest, response: Response) {
  const loanId = routeId(request, "loanId");
  const loan = await findOwnedLoan(request, loanId);
  if (!loan) return response.status(404).json({ message: "Préstamo no encontrado" });

  const items = await LoanPayment.find({ userId: request.auth?.userId, loanId }).sort({
    paymentMonth: 1,
    createdAt: 1,
  });

  return response.json({ items: items.map(serializePayment) });
}

export async function createLoanPayment(request: AuthenticatedRequest, response: Response) {
  const loanId = routeId(request, "loanId");
  const loan = await findOwnedLoan(request, loanId);
  if (!loan) return response.status(404).json({ message: "Préstamo no encontrado" });

  const payload = validateWithSchema(loanPaymentSchema, request.body);
  const paymentMonth = normalizePaymentMonth(payload.paymentMonth);
  if (!paymentMonth) throw new HttpError(400, "Payment month must use YYYY-MM format");
  const existingPayment = await findConflictingPayment({
    loanId,
    userId: request.auth?.userId,
    paymentMonth,
  });
  if (existingPayment) {
    return response.status(409).json({
      message: "A payment already exists for this loan and month.",
    });
  }

  let item;
  try {
    item = await LoanPayment.create({ amount: payload.amount, paymentMonth, userId: request.auth?.userId, loanId });
  } catch (error: any) {
    if (error?.code === 11000) throw new HttpError(409, "A payment already exists for this loan and month.");
    throw error;
  }

  await touchLoan(loanId);
  return response.status(201).json({ item: serializePayment(item) });
}

export async function updateLoanPayment(request: AuthenticatedRequest, response: Response) {
  const loanId = routeId(request, "loanId");
  const paymentId = routeId(request, "paymentId");
  const loan = await findOwnedLoan(request, loanId);
  if (!loan) return response.status(404).json({ message: "Préstamo no encontrado" });

  const currentPayment = await LoanPayment.findOne({ _id: paymentId, loanId, userId: request.auth?.userId });
  if (!currentPayment) return response.status(404).json({ message: "Pago no encontrado" });
  if (currentPayment.expenseId) {
    return response.status(400).json({ message: "Los pagos vinculados a un gasto se editan desde el movimiento" });
  }

  const payload = validateWithSchema(loanPaymentSchema, request.body);
  const paymentMonth = normalizePaymentMonth(payload.paymentMonth);
  if (!paymentMonth) throw new HttpError(400, "Payment month must use YYYY-MM format");
  const existingPayment = await findConflictingPayment({
    loanId,
    userId: request.auth?.userId,
    paymentMonth,
    excludedPaymentId: paymentId,
  });
  if (existingPayment) {
    return response.status(409).json({
      message: "A payment already exists for this loan and month.",
    });
  }

  let item;
  try {
    item = await LoanPayment.findOneAndUpdate(
      { _id: paymentId, loanId, userId: request.auth?.userId },
      { amount: payload.amount, paymentMonth },
      { new: true },
    );
  } catch (error: any) {
    if (error?.code === 11000) throw new HttpError(409, "A payment already exists for this loan and month.");
    throw error;
  }
  if (!item) return response.status(404).json({ message: "Pago no encontrado" });

  await touchLoan(loanId);
  return response.json({ item: serializePayment(item) });
}

export async function deleteLoanPayment(request: AuthenticatedRequest, response: Response) {
  const loanId = routeId(request, "loanId");
  const paymentId = routeId(request, "paymentId");
  const loan = await findOwnedLoan(request, loanId);
  if (!loan) return response.status(404).json({ message: "Préstamo no encontrado" });

  const currentPayment = await LoanPayment.findOne({ _id: paymentId, loanId, userId: request.auth?.userId });
  if (!currentPayment) return response.status(404).json({ message: "Pago no encontrado" });
  if (currentPayment.expenseId) {
    return response.status(400).json({ message: "Los pagos vinculados a un gasto se eliminan desde el movimiento" });
  }

  await LoanPayment.deleteOne({ _id: paymentId, loanId, userId: request.auth?.userId });
  await touchLoan(loanId);
  return response.status(204).send();
}
