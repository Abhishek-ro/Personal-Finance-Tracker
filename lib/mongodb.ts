import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(" Please define the MONGODB_URI in your .env.local file.");
}

const cached = (global as any).mongoose ?? { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      dbName: "finance-tracker",
    });
   
    cached.conn = connection;
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw new Error(
      "MongoDB connection error. Check your credentials or network."
    );
  }
}
