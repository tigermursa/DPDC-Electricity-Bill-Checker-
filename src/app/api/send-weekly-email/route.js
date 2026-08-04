// app/api/send-weekly-email/route.js

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { sendWeeklyBillEmail } from "@/lib/email";
import { Bill } from "@/lib/db";

// Subscriber Schema (রিইউজ)
import mongoose from "mongoose";
const subscriberSchema = new mongoose.Schema({
  customerNumber: { type: String, required: true, index: true },
  email: { type: String, required: true },
  customerName: String,
  subscribedAt: { type: Date, default: Date.now },
  lastSentAt: Date,
  isActive: { type: Boolean, default: true },
});
const Subscriber =
  mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);

export async function GET() {
  try {
    console.log("📧 Weekly email cron started at", new Date().toISOString());

    await connectToDatabase();

    // সব সক্রিয় সাবস্ক্রাইবার পাই
    const subscribers = await Subscriber.find({ isActive: true });

    if (subscribers.length === 0) {
      console.log("ℹ️ No subscribers found");
      return NextResponse.json({ message: "No subscribers" });
    }

    console.log(
      `📧 Sending weekly emails to ${subscribers.length} subscribers`,
    );

    const results = [];
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    for (const sub of subscribers) {
      try {
        // গত ৭ দিনের বিল খুঁজি
        const bills = await Bill.find({
          customerNumber: sub.customerNumber,
          checkedAt: { $gte: lastWeek, $lte: now },
        }).sort({ checkedAt: -1 });

        if (bills.length === 0) {
          console.log(
            `ℹ️ No bills found for ${sub.customerNumber} in last 7 days`,
          );
          // বিকল্প: ১টি বিল থাকলে সেটা পাঠানো যায়
          const lastBill = await Bill.findOne({
            customerNumber: sub.customerNumber,
          }).sort({ checkedAt: -1 });

          if (!lastBill) {
            console.log(`⚠️ No bill history for ${sub.customerNumber}`);
            continue;
          }

          // শুধু লেটেস্ট বিল পাঠাই
          await sendWeeklyBillEmail({
            to: sub.email,
            customerName: lastBill.customerName || sub.customerNumber,
            customerNumber: sub.customerNumber,
            lastWeekBill: lastBill.balance,
            currentBill: lastBill.balance,
            dateRange: `${new Date(lastBill.checkedAt).toLocaleDateString()} - ${new Date(lastBill.checkedAt).toLocaleDateString()}`,
          });

          results.push({
            email: sub.email,
            status: "sent (no recent data)",
          });

          // লাস্ট সেন্ট আপডেট
          sub.lastSentAt = now;
          await sub.save();
          continue;
        }

        const currentBill = bills[0];
        const lastWeekBill = bills.length > 1 ? bills[1] : currentBill;

        const dateRange = `${new Date(lastWeek).toLocaleDateString()} - ${new Date(now).toLocaleDateString()}`;

        await sendWeeklyBillEmail({
          to: sub.email,
          customerName: currentBill.customerName || sub.customerNumber,
          customerNumber: sub.customerNumber,
          lastWeekBill: lastWeekBill.balance,
          currentBill: currentBill.balance,
          dateRange,
        });

        results.push({
          email: sub.email,
          status: "sent",
        });

        // লাস্ট সেন্ট আপডেট
        sub.lastSentAt = now;
        await sub.save();
      } catch (err) {
        console.error(`❌ Failed to send to ${sub.email}:`, err.message);
        results.push({
          email: sub.email,
          status: "failed",
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      message: "Weekly emails sent",
      total: subscribers.length,
      results,
    });
  } catch (error) {
    console.error("❌ Weekly email cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
