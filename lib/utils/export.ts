import { ParticipantLedger, Settlement } from './calculations';

export interface Expense {
  _id: string;
  tripId: string;
  amount: number;
  currency: string;
  payerId: string;
  date: Date | string;
  category: string;
  description: string;
  receiptUrl?: string;
  tax?: number;
  taxPercent?: number;
  tip?: number;
  tipPercent?: number;
  splitType: string;
  splitDetails: Record<string, number>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

export interface Trip {
  _id: string;
  title: string;
  startDate: Date | string;
  endDate: Date | string;
  currency: string;
  participants: Participant[];
  ownerId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function generateCSVExport(
  trip: Trip,
  expenses: Expense[],
  ledger: ParticipantLedger[],
  settlements: Settlement[]
): string {
  const lines: string[] = [];

  // Header
  lines.push(`Trip: ${trip.title}`);
  lines.push(`Currency: ${trip.currency}`);
  lines.push(`Period: ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`);
  lines.push('');

  // Expenses
  lines.push('EXPENSES');
  lines.push(
    'Date,Payer,Category,Amount,Tax,Tip,Total,Split Type,Description'
  );

  for (const expense of expenses) {
    const taxAmount = expense.tax || (expense.taxPercent !== undefined ? (expense.amount * expense.taxPercent) / 100 : 0);
    const tipAmount = expense.tip || (expense.tipPercent !== undefined ? (expense.amount * expense.tipPercent) / 100 : 0);
    const total = expense.amount + taxAmount + tipAmount;
    
    const payer = trip.participants.find((p) => p.id === expense.payerId)?.name || expense.payerId;
    const date = new Date(expense.date).toLocaleDateString();
    const description = (expense.description || '').replace(/"/g, '""');

    lines.push(
      `"${date}","${payer}","${expense.category}",${expense.amount},${taxAmount},${tipAmount},${total},"${expense.splitType}","${description}"`
    );
  }

  lines.push('');

  // Ledger
  lines.push('PER-PERSON LEDGER');
  lines.push('Person,Total Paid,Total Owed,Net Balance');

  for (const entry of ledger) {
    lines.push(
      `"${entry.name}",${entry.totalPaid},${entry.totalOwed},${entry.netBalance}`
    );
  }

  lines.push('');

  // Settlements
  lines.push('SETTLEMENT TRANSACTIONS');
  lines.push('From,To,Amount');

  for (const settlement of settlements) {
    lines.push(`"${settlement.fromName}","${settlement.toName}",${settlement.amount}`);
  }

  return lines.join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
