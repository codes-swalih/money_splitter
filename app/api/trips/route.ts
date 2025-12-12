import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { Trip, Expense } from "@/lib/db/models";
import { calculateLedger, generateSettlement } from "@/lib/utils/calculations";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      title,
      startDate,
      endDate,
      currency = "INR",
      participants,
      ownerId,
    } = body;

    if (!title || !startDate || !endDate || !participants || !ownerId) {
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
      ownerId,
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
    await dbConnect();

    // Allow optional ownerId query param, default to 'user-1' for local/demo use
    const url = new URL(request.url);
    const ownerId = url.searchParams.get('ownerId') || 'user-1';

    const trips = await Trip.find({ ownerId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error) {
    console.error('GET /api/trips error:', error);
    const debug = process.env.DEBUG_API === 'true';
    const message = debug
      ? error instanceof Error
        ? error.message
        : String(error)
      : 'Failed to fetch trips';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
