// lib/db.js

import mongoose from "mongoose";

const MONGODB_URI = process.env.DB_URL;

if (!MONGODB_URI && process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️ DB_URL not set in environment. MongoDB features will be disabled.",
  );
}

let cached = global.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn(
      "⚠️ MongoDB URI not configured. Skipping database connection.",
    );
    return null; // অথবা throw করবেন না, তবে API route-এ check করে নেবেন
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // timeout কমিয়ে দিলাম
    });
  }
  cached.conn = await cached.promise;
  global.mongoose = cached;
  return cached.conn;
}

// Schema & Model (এখানেও কোনো error throw করবে না)
const BillSchema = new mongoose.Schema({
  customerNumber: { type: String, required: true, index: true },
  balance: { type: Number, required: true },
  customerName: String,
  accountId: String,
  checkedAt: { type: Date, default: Date.now },
});

export const Bill = mongoose.models.Bill || mongoose.model("Bill", BillSchema);
