import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    await clearAuthCookie();
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
