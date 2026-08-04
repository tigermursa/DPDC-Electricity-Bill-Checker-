// lib/email.js

import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;

// SMTP ট্রান্সপোর্টার তৈরি
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // 465 পোর্ট হলে SSL
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * সাপ্তাহিক বিল রিপোর্ট ইমেইল পাঠানোর ফাংশন
 */
export async function sendWeeklyBillEmail({
  to,
  customerName,
  customerNumber,
  lastWeekBill,
  currentBill,
  dateRange,
}) {
  const subject = `📊 DPDC Bill Update – ${dateRange}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0f; padding: 20px; color: #e0e0e0; }
        .container { max-width: 600px; margin: 0 auto; background: #14141e; border-radius: 16px; padding: 30px; border: 1px solid #2a2a3e; }
        .header { text-align: center; border-bottom: 1px solid #2a2a3e; padding-bottom: 20px; }
        .header h1 { color: #00d4ff; font-size: 24px; margin: 0; }
        .header p { color: #888; font-size: 14px; }
        .bill-box { background: #1a1a2e; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #00d4ff; }
        .bill-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #2a2a3e; }
        .bill-row:last-child { border-bottom: none; }
        .label { color: #888; font-size: 14px; }
        .value { font-weight: bold; font-size: 18px; }
        .value.green { color: #00ff96; }
        .value.red { color: #ff4444; }
        .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #2a2a3e; font-size: 12px; color: #555; }
        .highlight { color: #00d4ff; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ DPDC Bill Report</h1>
          <p>${dateRange}</p>
        </div>

        <div class="bill-box">
          <div class="bill-row">
            <span class="label"> Customer</span>
            <span class="value">${customerName || customerNumber}</span>
          </div>
          <div class="bill-row">
            <span class="label"> Account</span>
            <span class="value">${customerNumber}</span>
          </div>
          <div class="bill-row">
            <span class="label"> Last Week Bill</span>
            <span class="value ${lastWeekBill >= 0 ? "green" : "red"}">৳ ${lastWeekBill.toFixed(2)}</span>
          </div>
          <div class="bill-row">
            <span class="label">Current Bill</span>
            <span class="value ${currentBill >= 0 ? "green" : "red"}">৳ ${currentBill.toFixed(2)}</span>
          </div>
          <div class="bill-row" style="border-top: 2px solid #00d4ff; margin-top: 5px; padding-top: 12px;">
            <span class="label"> Change</span>
            <span class="value ${currentBill - lastWeekBill >= 0 ? "red" : "green"}">
              ${currentBill - lastWeekBill >= 0 ? "+" : ""}${(currentBill - lastWeekBill).toFixed(2)}
            </span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #888;">
          This is your weekly DPDC bill update.<br>
          Check your latest balance anytime at <span class="highlight">${process.env.NEXT_PUBLIC_APP_URL || "https://my-bill-two.vercel.app"}</span>
        </div>

        <div class="footer">
          Developed by Mursalin Hossain<br>
          
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: SMTP_FROM,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Weekly email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
}
