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
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
  }
  cached.conn = await cached.promise;
  global.mongoose = cached;
  return cached.conn;
}

// Bill Schema (আগের মতো)
const BillSchema = new mongoose.Schema({
  customerNumber: { type: String, required: true, index: true },
  balance: { type: Number, required: true },
  customerName: String,
  accountId: String,
  checkedAt: { type: Date, default: Date.now },
});

export const Bill = mongoose.models.Bill || mongoose.model("Bill", BillSchema);

// Subscriber Schema
const SubscriberSchema = new mongoose.Schema({
  customerNumber: { type: String, required: true, index: true },
  email: { type: String, required: true },
  customerName: String,
  subscribedAt: { type: Date, default: Date.now },
  lastSentAt: Date,
  isActive: { type: Boolean, default: true },
});

export const Subscriber =
  mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema);
