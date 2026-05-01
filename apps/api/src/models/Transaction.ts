import { Schema, Types, model } from "mongoose";

const transactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    bankAccountId: { type: Types.ObjectId, ref: "BankAccount" },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Transaction = model("Transaction", transactionSchema);
