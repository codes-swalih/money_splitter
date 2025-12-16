import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { Trip, Expense } from "@/lib/db/models";
import { calculateLedger, generateSettlement } from "@/lib/utils/calculations";
import { getCurrentUser } from "@/lib/utils/auth";
import mongoose from "mongoose";

// Settlement history schema - moved outside and with proper checks
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

// Prevent model recompilation error
const Settlement =
  mongoose.models.Settlement || mongoose.model("Settlement", SettlementSchema);

export async function GET(
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

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Check if user owns this trip
    if (trip.ownerId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const expenses = await Expense.find({ tripId: id }).sort({ date: -1 });

    // Fetch recorded settlements with error handling
    let recordedSettlements = [];
    try {
      recordedSettlements = await Settlement.find({ tripId: id }).sort({
        settledAt: -1,
      });
    } catch (settlementError) {
      console.error("Error fetching settlements:", settlementError);
      // Continue without settlements if there's an error
    }

    // Calculate ledger and settlement
    const ledger = calculateLedger(
      expenses.map((e) => ({
        id: e._id.toString(),
        payerId: e.payerId,
        amount: e.amount,
        taxPercent: e.taxPercent || 0,
        taxAbsolute: e.tax || 0,
        tipPercent: e.tipPercent || 0,
        tipAbsolute: e.tip || 0,
        splitType: e.splitType,
        splitDetails: e.splitDetails || {},
      })),
      trip.participants || [],
      recordedSettlements // Pass recorded settlements to calculation
    );

    const settlements = generateSettlement(ledger);

    return NextResponse.json({
      trip,
      expenses,
      ledger,
      settlements,
      recordedSettlements, // Include recorded settlements in response
    });
  } catch (error) {
    console.error("Error in GET /api/trips/[id]:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch trip",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
    }

    const body = await request.json();

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.ownerId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error("Error in PUT /api/trips/[id]:", error);
    return NextResponse.json(
      {
        error: "Failed to update trip",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.ownerId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Trip.findByIdAndDelete(id);
    await Expense.deleteMany({ tripId: id });
    await Settlement.deleteMany({ tripId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/trips/[id]:", error);
    return NextResponse.json(
      {
        error: "Failed to delete trip",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
