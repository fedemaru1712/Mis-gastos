import { Schema, Types, model } from "mongoose";

const investmentSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["stock", "crypto", "fund", "etf", "bond", "other"], required: true },
    symbol: { type: String },
    platform: { type: String },
    monthlyEntries: [
      {
        month: { type: String, required: true },
        contribution: { type: Number, required: true, min: 0 },
        endOfMonthValue: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true },
);

export const Investment = model("Investment", investmentSchema);
