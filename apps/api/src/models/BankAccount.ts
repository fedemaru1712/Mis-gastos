import { Schema, Types, model } from "mongoose";

const bankAccountSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    currency: { type: String, required: true },
  },
  { timestamps: true },
);

export const BankAccount = model("BankAccount", bankAccountSchema);
