import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { Trip, Expense } from "@/lib/db/models";
import { calculateLedger, generateSettlement } from "@/lib/utils/calculations";
import { getCurrentUser } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    const { title, startDate, endDate, currency = "INR", participants } = body;

    if (!title || !startDate || !endDate || !participants) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const trip = await Trip.create({
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      currency,
      participants,
      ownerId: user.userId,
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    // Log full error on the server for diagnosis
    // (kept out of default client response to avoid leaking internals)
    // If you set DEBUG_API=true in the environment, the real error
    // message will be returned in the response to help debugging.
    console.error("POST /api/trips error:", error);
    const debug = process.env.DEBUG_API === "true";
    const message = debug
      ? error instanceof Error
        ? error.message
        : String(error)
      : "Failed to create trip";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const trips = await Trip.find({ ownerId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error) {
    console.error("GET /api/trips error:", error);
    const debug = process.env.DEBUG_API === "true";
    const message = debug
      ? error instanceof Error
        ? error.message
        : String(error)
      : "Failed to fetch trips";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
