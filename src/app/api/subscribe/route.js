// app/api/subscribe/route.js

import { NextResponse } from "next/server";
import { connectToDatabase, Subscriber } from "@/lib/db";

export async function POST(request) {
  try {
    const { customerNumber, email } = await request.json();

    if (!customerNumber || !email) {
      return NextResponse.json(
        { error: "customerNumber and email are required" },
        { status: 400 },
      );
    }

    // ইমেইল ভ্যালিডেশন
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // চেক করি ইতিমধ্যে সাবস্ক্রাইব করেছে কিনা
    const existing = await Subscriber.findOne({ customerNumber, email });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
        return NextResponse.json({
          message: "Subscription re-activated successfully",
        });
      }
      return NextResponse.json({
        message: "Already subscribed with this email",
      });
    }

    // নতুন সাবস্ক্রাইবার তৈরি
    const subscriber = new Subscriber({
      customerNumber,
      email,
    });

    await subscriber.save();

    return NextResponse.json({
      message: "Subscription successful! You'll receive weekly bill updates.",
    });
  } catch (error) {
    console.error("❌ Subscribe error:", error);
    return NextResponse.json(
      { error: error.message || "Subscription failed" },
      { status: 500 },
    );
  }
}
