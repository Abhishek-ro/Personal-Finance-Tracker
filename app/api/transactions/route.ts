import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/model/transaction.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const transactions = await Transaction.find().sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { amount, date, description, category } = await req.json();
    if (!amount || !date || !description || !category) {
      return;
    }
    await connectDB();
    const newTx = await Transaction.create({
      amount,
      date,
      description,
      category,
    });
    return NextResponse.json(newTx, { status: 201 });
  } catch  {
    console.error("POST /api/transactions error:");
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
