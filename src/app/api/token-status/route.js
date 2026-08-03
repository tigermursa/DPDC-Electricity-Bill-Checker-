import { NextResponse } from "next/server";

export async function GET() {
  try {
    const status = getTokenStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
