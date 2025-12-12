import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db/connection';
import { Expense } from '@/lib/db/models';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    await dbConnect();
    const { expenseId } = await params;
    const body = await request.json();

    const expense = await Expense.findByIdAndUpdate(expenseId, body, {
      new: true,
    });
    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    await dbConnect();
    const { expenseId } = await params;

    await Expense.findByIdAndDelete(expenseId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
