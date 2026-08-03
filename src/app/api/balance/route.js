import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/token";
import { connectToDatabase, Bill } from "@/lib/db";

const API_URL = "https://amiapp.dpdc.org.bd/usage/usage-service";

export async function POST(request) {
  try {
    const { customerNumber } = await request.json();

    if (!customerNumber) {
      return NextResponse.json(
        { error: "Customer number required" },
        { status: 400 },
      );
    }

    const token = await getValidAccessToken();

    const query = `query{ postBalanceDetails(input :{\n        customerNumber:"${customerNumber.trim()}",tenantCode:"DPDC"       \n    } ) {  accountId customerName customerClass mobileNumber emailId  accountType balanceRemaining connectionStatus customerType minRecharge}}`;

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

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.errors?.[0]?.message || "API error" },
        { status: res.status },
      );
    }

    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0]?.message },
        { status: 400 },
      );
    }

    const billData = data.data?.postBalanceDetails;
    if (!billData) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    // Save to DB if balance changed
    try {
      const db = await connectToDatabase();
      if (db) {
        const balance = parseFloat(billData.balanceRemaining);
        if (!isNaN(balance)) {
          const last = await Bill.findOne({ customerNumber })
            .sort({ checkedAt: -1 })
            .lean();
          if (!last || Math.abs(last.balance - balance) > 0.01) {
            await Bill.create({
              customerNumber,
              balance,
              customerName: billData.customerName,
              accountId: billData.accountId,
            });
            console.log("✅ Bill saved to MongoDB");
          }
        }
      }
    } catch (dbErr) {
      console.warn("⚠️ DB save skipped:", dbErr.message);
    }

    return NextResponse.json({ data: billData });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
