import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db/connection';
import { Trip, Expense } from '@/lib/db/models';
import { calculateExpenseSplit } from '@/lib/utils/calculations';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Verify trip exists
    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const {
      amount,
      payerId,
      category,
      date,
      description,
      receiptUrl,
      tax,
      taxPercent,
      tip,
      tipPercent,
      splitType,
      splitDetails,
    } = body;

    // Validate expense
    if (!amount || !payerId || !category || !date || !splitType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that payer is in participants
    if (!trip.participants.find((p: any) => p.id === payerId)) {
      return NextResponse.json(
        { error: 'Payer is not a trip participant' },
        { status: 400 }
      );
    }

    // Calculate and validate split
    try {
      const calc = calculateExpenseSplit(
        amount,
        splitType,
        trip.participants.map((p: any) => p.id),
        splitDetails,
        taxPercent,
        tax,
        tipPercent,
        tip
      );
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const expense = await Expense.create({
      tripId: id,
      amount,
      currency: trip.currency,
      payerId,
      date: new Date(date),
      category,
      description,
      receiptUrl,
      tax,
      taxPercent,
      tip,
      tipPercent,
      splitType,
      splitDetails: splitDetails || {},
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
