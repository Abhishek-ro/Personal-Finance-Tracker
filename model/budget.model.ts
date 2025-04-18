import { Schema, model, models, Document } from "mongoose";

export interface IBudget extends Document {
  month: string;
  category: string;
  budget: number;
}

const BudgetSchema = new Schema<IBudget>({
  month: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Food", "Rides", "Shop ", "Bills", "Fun", "Other"],
  },
  budget: {
    type: Number,
    required: true,
  },
});

export const Budget = models.Budget || model<IBudget>("Budget", BudgetSchema);
