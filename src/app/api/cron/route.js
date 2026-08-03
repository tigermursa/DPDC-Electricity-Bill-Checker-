import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/token";
import { connectToDatabase, Bill } from "@/lib/db";

const API_URL = "https://amiapp.dpdc.org.bd/usage/usage-service";
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const TARGET_CUSTOMER = "35100879";

export async function GET() {
  try {
    console.log("⏰ Cron job started at", new Date().toISOString());

    if (!DISCORD_WEBHOOK) {
      console.warn("⚠️ DISCORD_WEBHOOK_URL not set");
      return NextResponse.json(
        { error: "Discord webhook not configured" },
        { status: 500 },
      );
    }

    const token = await getValidAccessToken();

    const query = `query{ postBalanceDetails(input :{\n        customerNumber:"${TARGET_CUSTOMER}",tenantCode:"DPDC"       \n    } ) {  accountId customerName customerClass mobileNumber emailId  accountType balanceRemaining connectionStatus customerType minRecharge}}`;

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
        accessToken: token,
        tenantCode: "DPDC",
        clientid: "auth-ui",
        clientsecret: "0yFsAl4nN9jX1GGkgOrvpUxDarf2DT40",
        Cookie: "i18next=en",
        Origin: "https://amiapp.dpdc.org.bd",
        Referer: "https://amiapp.dpdc.org.bd/quick-pay",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    if (!res.ok || data.errors) {
      const errMsg = data?.errors?.[0]?.message || "API error";
      console.error("❌ API error:", errMsg);
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    const billData = data.data?.postBalanceDetails;
    if (!billData) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const newBalance = parseFloat(billData.balanceRemaining);
    if (isNaN(newBalance)) {
      return NextResponse.json({ error: "Invalid balance" }, { status: 500 });
    }

    // Check last saved balance from DB
    await connectToDatabase();
    const lastBill = await Bill.findOne({ customerNumber: TARGET_CUSTOMER })
      .sort({ checkedAt: -1 })
      .lean();

    const lastBalance = lastBill?.balance ?? null;

    // If balance changed (or no previous record)
    if (lastBalance === null || Math.abs(lastBalance - newBalance) > 0.01) {
      // Send Discord notification
      const message = `💰 **New Balance Update!**\nCustomer: ${TARGET_CUSTOMER}\nBalance: ৳ ${newBalance.toFixed(2)}`;
      await fetch(DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      console.log("✅ Discord notification sent for new balance:", newBalance);

      // Save to DB
      await Bill.create({
        customerNumber: TARGET_CUSTOMER,
        balance: newBalance,
        customerName: billData.customerName,
        accountId: billData.accountId,
      });

      return NextResponse.json({
        message: "Balance changed, Discord notified",
        oldBalance: lastBalance,
        newBalance,
      });
    } else {
      console.log("ℹ️ Balance unchanged, no Discord notification");
      return NextResponse.json({
        message: "Balance unchanged",
        balance: newBalance,
      });
    }
  } catch (error) {
    console.error("❌ Cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
