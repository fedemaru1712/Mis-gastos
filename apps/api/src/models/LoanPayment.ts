import { Schema, Types, model } from "mongoose";

const loanPaymentSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    loanId: { type: Types.ObjectId, ref: "Loan", required: true, index: true },
    expenseId: { type: Types.ObjectId, ref: "Transaction" },
    amount: { type: Number, required: true, min: 0 },
    paymentMonth: { type: String, required: true },
  },
  { timestamps: true },
);

loanPaymentSchema.index({ loanId: 1, paymentMonth: 1 }, { unique: true });
loanPaymentSchema.index({ expenseId: 1 }, { unique: true, sparse: true });

export const LoanPayment = model("LoanPayment", loanPaymentSchema);
