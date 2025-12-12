import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { Trip, Expense } from "@/lib/db/models";
import { generateCSVExport } from "@/lib/utils/export";
import { calculateLedger, generateSettlement } from "@/lib/utils/calculations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const expenses = await Expense.find({ tripId: id });

    const ledger = calculateLedger(
      expenses.map((e: any) => ({
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

    if (format === "csv") {
      const csv = generateCSVExport(
        trip.toObject ? trip.toObject() : trip,
        expenses.map((e: any) => (e.toObject ? e.toObject() : e)),
        ledger,
        settlements
      );

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv;charset=utf-8;",
          "Content-Disposition": `attachment; filename="trip-${
            trip.title
          }-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export trip" },
      { status: 500 }
    );
  }
}
