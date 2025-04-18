import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI in your .env.local file.");
}

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}


declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}


const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB(): Promise<Connection> {
  if (cached.conn) return cached.conn;


  cached.promise ??= mongoose
    .connect(MONGODB_URI, {
      dbName: "finance-tracker",
    })
    .then((m) => m.connection);

  cached.conn = await cached.promise;
  return cached.conn;
}
