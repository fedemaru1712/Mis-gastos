import mongoose from "mongoose";
import { LoanPayment } from "../models/LoanPayment.js";

function buildPaymentMonth(year?: number | null, month?: number | null) {
  if (!Number.isInteger(year) || !Number.isInteger(month)) return "";
  if ((month as number) < 1 || (month as number) > 12) return "";
  return `${year}-${String(month).padStart(2, "0")}`;
}

function resolveLegacyPaymentMonth(item: Record<string, unknown>) {
  const paymentMonth = typeof item.paymentMonth === "string" ? item.paymentMonth.trim() : "";
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(paymentMonth)) return paymentMonth;

  const paymentDate = typeof item.paymentDate === "string" ? item.paymentDate : "";
  if (/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(paymentDate)) return paymentDate.slice(0, 7);

  const paidAt = typeof item.paidAt === "string" ? item.paidAt : "";
  if (/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(paidAt)) return paidAt.slice(0, 7);

  return buildPaymentMonth(item.year as number | null | undefined, item.month as number | null | undefined);
}

export async function runMigrations() {
  const collection = mongoose.connection.collection("loanpayments");
  const legacyPayments = await collection
    .find({
      $or: [
        { year: { $exists: true } },
        { month: { $exists: true } },
        { paymentDate: { $exists: true } },
        { paidAt: { $exists: true } },
        { paymentMonth: { $exists: false } },
      ],
    })
    .toArray();

  for (const item of legacyPayments) {
    const paymentMonth = resolveLegacyPaymentMonth(item);
    if (!paymentMonth) continue;

    await collection.updateOne(
      { _id: item._id },
      {
        $set: { paymentMonth },
        $unset: { year: "", month: "", paymentDate: "", paidAt: "", notes: "" },
      },
    );
  }

  try {
    await collection.dropIndex("loanId_1_year_1_month_1");
  } catch (error: any) {
    if (error?.codeName !== "IndexNotFound") throw error;
  }

  try {
    await collection.dropIndex("expenseId_1");
  } catch (error: any) {
    if (error?.codeName !== "IndexNotFound") throw error;
  }

  await LoanPayment.syncIndexes();
}
