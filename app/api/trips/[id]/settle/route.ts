import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { Trip } from "@/lib/db/models";
import { getCurrentUser } from "@/lib/utils/auth";
import mongoose from "mongoose";

// Settlement history schema
const SettlementSchema = new mongoose.Schema(
  {
    tripId: { type: String, required: true, index: true },
    fromId: { type: String, required: true },
    toId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    settledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Settlement =
  mongoose.models.Settlement || mongoose.model("Settlement", SettlementSchema);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const { fromId, toId, amount } = body;

    if (!fromId || !toId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify trip exists and user owns it
    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.ownerId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Record settlement
    const settlement = await Settlement.create({
      tripId: id,
      fromId,
      toId,
      amount,
    });

    return NextResponse.json(
      { message: "Settlement recorded", settlement },
      { status: 201 }
    );
  } catch (error) {
    console.error("Settle error:", error);
    const debug = process.env.DEBUG_API === "true";
    const message = debug
      ? error instanceof Error
        ? error.message
        : String(error)
      : "Failed to settle";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
