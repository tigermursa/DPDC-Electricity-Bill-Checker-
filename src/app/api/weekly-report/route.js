import { NextResponse } from "next/server";
import { connectToDatabase, Bill, Subscription } from "@/lib/db";
import { sendWeeklyReport } from "@/lib/email";

export async function GET() {
  try {
    console.log("📧 Weekly report job started at", new Date().toISOString());

    // Check if today is Friday
    const today = new Date().getDay();
    if (today !== 5) {
      // 5 = Friday
      console.log("ℹ️ Today is not Friday, skipping weekly report");
      return NextResponse.json({
        message: "Only runs on Friday",
      });
    }

    await connectToDatabase();

    // Get all active subscriptions
    const subscriptions = await Subscription.find({ active: true }).lean();

    if (subscriptions.length === 0) {
      console.log("ℹ️ No active subscriptions");
      return NextResponse.json({
        message: "No active subscriptions",
        count: 0,
      });
    }

    let successCount = 0;
    let failCount = 0;

    for (const sub of subscriptions) {
      try {
        // Get current balance
        const currentBill = await Bill.findOne({
          customerNumber: sub.customerNumber,
        })
          .sort({ checkedAt: -1 })
          .lean();

        if (!currentBill) {
          console.warn(`⚠️ No bill found for ${sub.customerNumber}`);
          continue;
        }

        // Get last week's balance (7 days ago)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const lastWeekBill = await Bill.findOne({
          customerNumber: sub.customerNumber,
          checkedAt: { $lte: oneWeekAgo },
        })
          .sort({ checkedAt: -1 })
          .lean();

        // Get recent history (last 10 entries)
        const recentHistory = await Bill.find({
          customerNumber: sub.customerNumber,
        })
          .sort({ checkedAt: -1 })
          .limit(10)
          .lean();

        const lastBalance = lastWeekBill?.balance ?? currentBill.balance;

        await sendWeeklyReport(
          sub.email,
          sub.customerNumber,
          lastBalance,
          currentBill.balance,
          recentHistory,
        );

        successCount++;
        console.log(`✅ Report sent to ${sub.email}`);
      } catch (error) {
        console.error(`❌ Failed for ${sub.email}:`, error.message);
        failCount++;
      }
    }

    return NextResponse.json({
      message: "Weekly reports sent",
      total: subscriptions.length,
      success: successCount,
      failed: failCount,
    });
  } catch (error) {
    console.error("❌ Weekly report error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
