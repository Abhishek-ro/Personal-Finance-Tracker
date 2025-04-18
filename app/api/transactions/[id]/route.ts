import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/model/transaction.model";
import mongoose from "mongoose";

async function seedDatabase() {
  try {
    await connectDB();
    const count = await Transaction.countDocuments({});
    if (count === 0) {
      const initialTransactions = [
        {
          amount: 75,
          date: "2025-04-15",
          description: "Groceries",
          category: "Food",
        },
        {
          amount: 25,
          date: "2025-04-16",
          description: "Movie ticket",
          category: "Fun",
        },
        {
          amount: 150,
          date: "2025-04-17",
          description: "Online shopping",
          category: "Shop",
        },
      ];
      await Transaction.insertMany(initialTransactions);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await seedDatabase();

    const transactions = await Transaction.find().sort({ date: -1 });
    console.log(req,params)
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error"},
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { amount, date, description, category } = await req.json();
    await connectDB();

    const newTx = await Transaction.create({
      amount,
      date,
      description,
      category,
    });
    return NextResponse.json(newTx, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction"},
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error(`DELETE /api/transactions/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete transaction"},
      { status: 500 }
    );
  }
}
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { amount, date, description, category } = await req.json();
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { amount, date, description, category },
      { new: true }
    );

    if (!updatedTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error(`PUT /api/transactions/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update transaction"},
      { status: 500 }
    );
  }
}
