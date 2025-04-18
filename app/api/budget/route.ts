import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Budget } from "@/model/budget.model";

export async function GET() {
  try {
    await connectDB();
    const budgets = await Budget.find();
    return NextResponse.json(budgets);
  } catch (error) {
    console.error("GET /api/budget error:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { month, category, budget } = await req.json();
    await connectDB();

    const newBudget = new Budget({
      month,
      category,
      budget,
    });

    await newBudget.save();

    return NextResponse.json(
      { message: "Budget added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/budget error:", error);
    return NextResponse.json(
      { error: "Failed to add budget" },
      { status: 500 }
    );
  }
}
