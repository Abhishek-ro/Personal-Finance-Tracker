import { Schema, Document, models, model } from "mongoose";

export interface ITransaction extends Document {
  amount: number;
  description: string;
  date: Date;
  category?: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ["Food", "Rides", "Shop ", "Bills", "Fun", "Other"],
      set: (v: string) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
      default: "Other",
    },
  },
  { timestamps: true }
);

export const Transaction =
  models.Transaction || model<ITransaction>("Transaction", TransactionSchema);
