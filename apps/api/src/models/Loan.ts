import { Schema, Types, model } from "mongoose";

const loanSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    initialAmount: { type: Number, required: true, min: 0 },
    monthlyPayment: { type: Number, required: true, min: 0 },
    paymentDay: { type: Number, required: true, min: 1, max: 31 },
    startDate: { type: String, required: true },
  },
  { timestamps: true },
);

export const Loan = model("Loan", loanSchema);
