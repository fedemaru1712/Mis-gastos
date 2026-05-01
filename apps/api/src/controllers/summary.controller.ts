import { Response } from "express";
import { monthParamSchema, yearParamSchema } from "@personal-finance/shared";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { Transaction } from "../models/Transaction.js";
import { validateWithSchema } from "../utils/validators.js";

function serializeTransaction(item: any) {
  return {
    id: item._id.toString(),
    userId: item.userId.toString(),
    type: item.type,
    amount: item.amount,
    category: item.category,
    description: item.description,
    date: item.date.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function getMonthRange(month: string) {
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

function buildMonthlyCashflow(month: string, entries: Array<{ _id: { day: number; type: string }; total: number }>) {
  const [yearValue, monthValue] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(yearValue, monthValue, 0)).getUTCDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const dayNumber = index + 1;
    const matchingEntries = entries.filter((entry) => entry._id.day === dayNumber);
    const income = matchingEntries.find((entry) => entry._id.type === "income")?.total ?? 0;
    const expense = matchingEntries.find((entry) => entry._id.type === "expense")?.total ?? 0;

    return {
      date: `${month}-${String(dayNumber).padStart(2, "0")}`,
      day: String(dayNumber),
      income,
      expense,
    };
  });
}

function buildAnnualMonths(year: string, entries: Array<{ _id: { month: number; type: string }; total: number }>) {
  return Array.from({ length: 12 }, (_, index) => {
    const monthNumber = index + 1;
    const matchingEntries = entries.filter((entry) => entry._id.month === monthNumber);
    const income = matchingEntries.find((entry) => entry._id.type === "income")?.total ?? 0;
    const expense = matchingEntries.find((entry) => entry._id.type === "expense")?.total ?? 0;

    return {
      month: `${year}-${String(monthNumber).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("es-ES", { month: "short", timeZone: "UTC" }).format(
        new Date(Date.UTC(Number(year), index, 1)),
      ),
      income,
      expense,
      balance: income - expense,
    };
  });
}

export async function getMonthlySummary(request: AuthenticatedRequest, response: Response) {
  const { month } = validateWithSchema(monthParamSchema, request.query);
  const currentMonth = month ?? new Date().toISOString().slice(0, 7);
  const { start, end } = getMonthRange(currentMonth);
  const userId = new Types.ObjectId(request.auth?.userId);

  const [totals, expenses, cashflow, recentTransactions] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, type: "expense", date: { $gte: start, $lt: end } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]),
    Transaction.aggregate([
      { $match: { userId, date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]),
    Transaction.find({ userId, date: { $gte: start, $lt: end } })
      .sort({ date: -1, createdAt: -1 })
      .limit(5),
  ]);

  const income = totals.find((item) => item._id === "income")?.total ?? 0;
  const expense = totals.find((item) => item._id === "expense")?.total ?? 0;

  return response.json({
    month: currentMonth,
    income,
    expense,
    balance: income - expense,
    cashflow: buildMonthlyCashflow(currentMonth, cashflow),
    recentTransactions: recentTransactions.map(serializeTransaction),
    expenseByCategory: expenses.map((item) => ({ category: item._id, total: item.total })),
  });
}

export async function getAnnualSummary(request: AuthenticatedRequest, response: Response) {
  const { year } = validateWithSchema(yearParamSchema, request.query);
  const currentYear = year ?? new Date().toISOString().slice(0, 4);
  const start = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const end = new Date(Date.UTC(Number(currentYear) + 1, 0, 1));
  const userId = new Types.ObjectId(request.auth?.userId);

  const monthlyTotals = await Transaction.aggregate([
    { $match: { userId, date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  const months = buildAnnualMonths(currentYear, monthlyTotals);
  const income = months.reduce((sum, item) => sum + item.income, 0);
  const expense = months.reduce((sum, item) => sum + item.expense, 0);

  return response.json({
    year: currentYear,
    income,
    expense,
    balance: income - expense,
    months,
  });
}
