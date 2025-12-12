import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { Trip, Expense } from "@/lib/db/models";
import { calculateLedger, generateSettlement } from "@/lib/utils/calculations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const expenses = await Expense.find({ tripId: id }).sort({ date: -1 });

    // Calculate ledger and settlement
    const ledger = calculateLedger(
      expenses.map((e) => ({
        id: e._id.toString(),
        payerId: e.payerId,
        amount: e.amount,
        taxPercent: e.taxPercent,
        taxAbsolute: e.tax,
        tipPercent: e.tipPercent,
        tipAbsolute: e.tip,
        splitType: e.splitType,
        splitDetails: e.splitDetails || {},
      })),
      trip.participants
    );

    const settlements = generateSettlement(ledger);

    return NextResponse.json({
      trip,
      expenses,
      ledger,
      settlements,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const trip = await Trip.findByIdAndUpdate(id, body, { new: true });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    await Trip.findByIdAndDelete(id);
    await Expense.deleteMany({ tripId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}
