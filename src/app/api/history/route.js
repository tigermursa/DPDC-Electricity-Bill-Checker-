import { NextResponse } from "next/server";
import { connectToDatabase, Bill } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerNumber = searchParams.get("customerNumber");

    if (!customerNumber) {
      return NextResponse.json(
        { error: "customerNumber required", history: [] },
        { status: 400 },
      );
    }

    console.log("🔍 Fetching history for:", customerNumber);

    // DB সংযোগ
    let db;
    try {
      db = await connectToDatabase();
    } catch (connError) {
      console.error("❌ MongoDB connection error:", connError.message);
      return NextResponse.json(
        {
          error: `Database connection failed: ${connError.message}`,
          history: [],
        },
        { status: 500 },
      );
    }

    if (!db) {
      console.warn("⚠️ MongoDB not configured");
      return NextResponse.json(
        { error: "Database not configured", history: [] },
        { status: 500 },
      );
    }

    console.log("✅ MongoDB connected, fetching bills...");

    const history = await Bill.find({ customerNumber })
      .sort({ checkedAt: -1 })
      .limit(100)
      .lean();

    console.log(`📊 Found ${history.length} bills for ${customerNumber}`);

    return NextResponse.json({ history, count: history.length });
  } catch (error) {
    console.error("❌ History API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        history: [],
      },
      { status: 500 },
    );
  }
}
