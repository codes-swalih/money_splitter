import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db/connection';
import { Trip, Expense } from '@/lib/db/models';
import { calculateLedger, generateSettlement } from '@/lib/utils/calculations';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { title, startDate, endDate, currency = 'INR', participants, ownerId } = body;

    if (!title || !startDate || !endDate || !participants || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
