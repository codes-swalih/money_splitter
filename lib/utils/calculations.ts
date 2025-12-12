export interface SplitDetail {
  [participantId: string]: number;
}

export interface ExpenseCalculation {
  totalExpense: number;
  taxAmount: number;
  tipAmount: number;
  shares: SplitDetail;
}

export interface ParticipantLedger {
  id: string;
  name: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
}

/**
 * Round to 2 decimal places with deterministic tie-breaking
 */
export function roundToTwoDec(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Calculate tax and tip amounts
 */
function calculateTaxTip(
  grossAmount: number,
  taxPercent?: number,
  taxAbsolute?: number,
  tipPercent?: number,
  tipAbsolute?: number
): { taxAmount: number; tipAmount: number } {
  let taxAmount = 0;
  let tipAmount = 0;

  if (taxPercent !== undefined && taxPercent > 0) {
    taxAmount = roundToTwoDec((grossAmount * taxPercent) / 100);
  } else if (taxAbsolute !== undefined && taxAbsolute > 0) {
    taxAmount = roundToTwoDec(taxAbsolute);
  }

  if (tipPercent !== undefined && tipPercent > 0) {
    tipAmount = roundToTwoDec((grossAmount * tipPercent) / 100);
  } else if (tipAbsolute !== undefined && tipAbsolute > 0) {
    tipAmount = roundToTwoDec(tipAbsolute);
  }

  return { taxAmount, tipAmount };
}

/**
 * Calculate equal split with proper rounding
 */
function calculateEqualSplit(
  totalExpense: number,
  participants: string[]
): SplitDetail {
  const n = participants.length;
  if (n === 0) return {};

  const baseShare = totalExpense / n;
  const roundedBase = Math.floor(baseShare * 100) / 100;
  const remainder = totalExpense - roundedBase * n;
  const remainderCents = Math.round(remainder * 100);

  const shares: SplitDetail = {};
  for (let i = 0; i < n; i++) {
    let share = roundedBase;
    if (i < remainderCents) {
      share += 0.01;
    }
    shares[participants[i]] = roundToTwoDec(share);
  }

  return shares;
}

/**
 * Calculate percentage split with proper rounding
 */
function calculatePercentageSplit(
  totalExpense: number,
  percentages: { [participantId: string]: number }
): SplitDetail {
  const participants = Object.keys(percentages).sort();
  const shares: SplitDetail = {};
  let totalAssigned = 0;

  for (let i = 0; i < participants.length - 1; i++) {
    const pId = participants[i];
    const share = roundToTwoDec((totalExpense * percentages[pId]) / 100);
    shares[pId] = share;
    totalAssigned += share;
  }

  // Last participant gets the remainder
  const lastPId = participants[participants.length - 1];
  shares[lastPId] = roundToTwoDec(totalExpense - totalAssigned);

  return shares;
}

/**
 * Validate custom amounts
 */
function validateCustomAmounts(
  customAmounts: SplitDetail,
  totalExpense: number
): { valid: boolean; error?: string } {
  const sum = Object.values(customAmounts).reduce((acc, val) => acc + val, 0);
  const diff = Math.abs(sum - totalExpense);

  if (diff > 0.01) {
    return {
      valid: false,
      error: `Custom amounts must sum to ${totalExpense} (got ${sum})`,
    };
  }

  return { valid: true };
}

/**
 * Main calculation function
 */
export function calculateExpenseSplit(
  grossAmount: number,
  splitType: "EQUAL" | "SELECTED_EQUAL" | "CUSTOM_AMOUNTS" | "PERCENTAGES",
  participants: string[],
  splitDetails?: SplitDetail,
  taxPercent?: number,
  taxAbsolute?: number,
  tipPercent?: number,
  tipAbsolute?: number
): ExpenseCalculation {
  if (grossAmount <= 0) {
    throw new Error("Expense amount must be greater than 0");
  }

  const { taxAmount, tipAmount } = calculateTaxTip(
    grossAmount,
    taxPercent,
    taxAbsolute,
    tipPercent,
    tipAbsolute
  );

  const totalExpense = roundToTwoDec(grossAmount + taxAmount + tipAmount);

  let shares: SplitDetail = {};

  if (splitType === "EQUAL") {
    shares = calculateEqualSplit(totalExpense, participants);
  } else if (splitType === "SELECTED_EQUAL") {
    const selectedParticipants = splitDetails
      ? Object.keys(splitDetails).sort()
      : participants;
    shares = calculateEqualSplit(totalExpense, selectedParticipants);
  } else if (splitType === "CUSTOM_AMOUNTS") {
    if (!splitDetails) {
      throw new Error("Custom amounts required for CUSTOM_AMOUNTS split");
    }
    const validation = validateCustomAmounts(splitDetails, totalExpense);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    shares = splitDetails;
  } else if (splitType === "PERCENTAGES") {
    if (!splitDetails) {
      throw new Error("Percentages required for PERCENTAGES split");
    }
    const percentageSum = Object.values(splitDetails).reduce(
      (a, b) => a + b,
      0
    );
    if (Math.abs(percentageSum - 100) > 0.01) {
      throw new Error(`Percentages must sum to 100 (got ${percentageSum})`);
    }
    shares = calculatePercentageSplit(totalExpense, splitDetails);
  }

  return {
    totalExpense,
    taxAmount,
    tipAmount,
    shares,
  };
}

/**
 * Calculate per-person ledger
 */
export function calculateLedger(
  expenses: Array<{
    id: string;
    payerId: string;
    amount: number;
    taxPercent?: number;
    taxAbsolute?: number;
    tipPercent?: number;
    tipAbsolute?: number;
    splitType: string;
    splitDetails: SplitDetail;
  }>,
  participants: Array<{ id: string; name: string }>
): ParticipantLedger[] {
  const ledger: { [id: string]: ParticipantLedger } = {};

  // Initialize
  for (const p of participants) {
    ledger[p.id] = {
      id: p.id,
      name: p.name,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0,
    };
  }

  // Process expenses
  for (const expense of expenses) {
    const calc = calculateExpenseSplit(
      expense.amount,
      expense.splitType as any,
      participants.map((p) => p.id),
      expense.splitDetails,
      expense.taxPercent,
      expense.taxAbsolute,
      expense.tipPercent,
      expense.tipAbsolute
    );

    // Update payer
    if (ledger[expense.payerId]) {
      ledger[expense.payerId].totalPaid = roundToTwoDec(
        ledger[expense.payerId].totalPaid + calc.totalExpense
      );
    }

    // Update owes
    for (const [pId, share] of Object.entries(calc.shares)) {
      if (ledger[pId]) {
        ledger[pId].totalOwed = roundToTwoDec(ledger[pId].totalOwed + share);
      }
    }
  }

  // Calculate net balances
  const ledgerArray = Object.values(ledger);
  for (const entry of ledgerArray) {
    entry.netBalance = roundToTwoDec(entry.totalPaid - entry.totalOwed);
  }

  // Normalize rounding errors
  const totalNet = roundToTwoDec(
    ledgerArray.reduce((sum, e) => sum + e.netBalance, 0)
  );

  if (Math.abs(totalNet) > 0.01) {
    // Find participant with smallest absolute balance and adjust
    let minIdx = 0;
    let minAbs = Math.abs(ledgerArray[0].netBalance);

    for (let i = 1; i < ledgerArray.length; i++) {
      const abs = Math.abs(ledgerArray[i].netBalance);
      if (abs < minAbs) {
        minAbs = abs;
        minIdx = i;
      }
    }

    ledgerArray[minIdx].netBalance = roundToTwoDec(
      ledgerArray[minIdx].netBalance - totalNet
    );
  }

  return ledgerArray.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Generate minimal settlement transactions
 */
export function generateSettlement(ledger: ParticipantLedger[]): Settlement[] {
  const settlements: Settlement[] = [];

  // Create lists of debtors and creditors
  const debtors = ledger
    .filter((l) => l.netBalance < -0.01)
    .map((l) => ({ ...l, balance: -l.netBalance }))
    .sort((a, b) => b.balance - a.balance);

  const creditors = ledger
    .filter((l) => l.netBalance > 0.01)
    .sort((a, b) => b.netBalance - a.netBalance);

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const transfer = Math.min(debtor.balance, creditor.netBalance);

    settlements.push({
      from: debtor.id,
      to: creditor.id,
      amount: roundToTwoDec(transfer),
      fromName: debtor.name,
      toName: creditor.name,
    });

    debtor.balance = roundToTwoDec(debtor.balance - transfer);
    creditor.netBalance = roundToTwoDec(creditor.netBalance - transfer);

    if (debtor.balance < 0.01) dIdx++;
    if (creditor.netBalance < 0.01) cIdx++;
  }

  return settlements;
}
