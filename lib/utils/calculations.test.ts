/**
 * Unit tests for expense splitting and settlement calculations
 * Run with: npx ts-node --transpile-only lib/utils/calculations.test.ts
 */

import {
  calculateExpenseSplit,
  calculateLedger,
  generateSettlement,
  ParticipantLedger,
  roundToTwoDec,
} from "./calculations";

// Test utilities
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

function assertClose(
  a: number,
  b: number,
  epsilon: number = 0.01,
  message: string = ""
) {
  const diff = Math.abs(a - b);
  if (diff > epsilon) {
    console.error(
      `❌ FAILED: ${message} | Expected ${b}, got ${a} (diff: ${diff})`
    );
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

// Test 1: Basic equal split
console.log("\n=== Test 1: Basic Equal Split ===");
try {
  const calc = calculateExpenseSplit(
    2345.5, // amount
    "EQUAL",
    ["1", "2", "3", "4", "5"],
    {},
    undefined,
    undefined,
    undefined,
    undefined
  );

  assertClose(
    calc.totalExpense,
    2345.5,
    0.01,
    "Total expense should be 2345.50"
  );
  assertClose(calc.shares["1"], 469.1, 0.01, "Each share should be 469.10");

  // Verify sum of shares equals total
  const shareSum = Object.values(calc.shares).reduce((a, b) => a + b, 0);
  assertClose(shareSum, 2345.5, 0.01, "Sum of shares should equal total");
} catch (e) {
  console.error("❌ Test failed:", e);
  process.exit(1);
}

// Test 2: Tax and tip calculation
console.log("\n=== Test 2: Tax and Tip ===");
try {
  const calc = calculateExpenseSplit(
    1000, // amount
    "EQUAL",
    ["1", "2", "3", "4", "5"],
    {},
    5, // 5% tax
    undefined,
    10, // 10% tip
    undefined
  );

  assertClose(calc.taxAmount, 50, 0.01, "Tax should be 50");
  assertClose(calc.tipAmount, 100, 0.01, "Tip should be 100");
  assertClose(calc.totalExpense, 1150, 0.01, "Total should be 1150");
  assertClose(calc.shares["1"], 230, 0.01, "Each share should be 230");
} catch (e) {
  console.error("❌ Test failed:", e);
  process.exit(1);
}

// Test 3: Selected equal split
console.log("\n=== Test 3: Selected Equal Split ===");
try {
  const calc = calculateExpenseSplit(
    8000,
    "SELECTED_EQUAL",
    ["1", "2", "3", "4", "5"],
    { "1": 0, "3": 0, "5": 0 }, // Only 3 people
    undefined,
    undefined,
    undefined,
    undefined
  );

  assertClose(calc.totalExpense, 8000, 0.01, "Total should be 8000");
  // 8000 / 3 = 2666.67 for 2 people, 2666.66 for 1 person
  const sum = Object.values(calc.shares).reduce((a, b) => a + b, 0);
  assertClose(sum, 8000, 0.01, "Sum of shares should equal total");
  assert(
    !calc.shares["2"] || calc.shares["2"] === 0,
    "Person 2 should not have a share"
  );
} catch (e) {
  console.error("❌ Test failed:", e);
  process.exit(1);
}

// Test 4: Custom amounts
console.log("\n=== Test 4: Custom Amounts ===");
try {
  const calc = calculateExpenseSplit(
    1200,
    "CUSTOM_AMOUNTS",
    ["1", "2", "3", "4", "5"],
    { "1": 400, "2": 200, "3": 200, "4": 200, "5": 200 },
    undefined,
    undefined,
    undefined,
    undefined
  );

  assertClose(calc.shares["1"], 400, 0.01, "Person 1 should pay 400");
  assertClose(calc.shares["2"], 200, 0.01, "Person 2 should pay 200");
  const sum = Object.values(calc.shares).reduce((a, b) => a + b, 0);
  assertClose(sum, 1200, 0.01, "Sum should equal total");
} catch (e) {
  console.error("❌ Test failed:", e);
  process.exit(1);
}

// Test 5: Percentages
console.log("\n=== Test 5: Percentages ===");
try {
  const calc = calculateExpenseSplit(
    1000,
    "PERCENTAGES",
    ["1", "2", "3"],
    { "1": 50, "2": 30, "3": 20 },
    undefined,
    undefined,
    undefined,
    undefined
  );

  assertClose(calc.shares["1"], 500, 0.01, "Person 1 should pay 50%");
  assertClose(calc.shares["2"], 300, 0.01, "Person 2 should pay 30%");
  assertClose(calc.shares["3"], 200, 0.01, "Person 3 should pay 20%");
  const sum = Object.values(calc.shares).reduce((a, b) => a + b, 0);
  assertClose(sum, 1000, 0.01, "Sum should equal total");
} catch (e) {
  console.error("❌ Test failed:", e);
  process.exit(1);
}

// Test 6: Ledger calculation
console.log("\n=== Test 6: Ledger Calculation ===");
try {
  const expenses = [
    {
      id: "e1",
      payerId: "2",
      amount: 2345.5,
      taxPercent: 0,
      taxAbsolute: undefined,
      tipPercent: 0,
      tipAbsolute: undefined,
      splitType: "EQUAL",
      splitDetails: {},
    },
  ];

  const participants = [
    { id: "1", name: "swalih" },
    { id: "2", name: "ijas" },
    { id: "3", name: "ameen" },
    { id: "4", name: "ameer" },
    { id: "5", name: "arshad ali" },
  ];

  const ledger = calculateLedger(expenses, participants);

  const ijasMoney = ledger.find((l) => l.id === "2");
  assert(!!ijasMoney, "Should find ijas in ledger");
  assertClose(ijasMoney!.totalPaid, 2345.5, 0.01, "ijas paid 2345.50");
  assertClose(ijasMoney!.totalOwed, 469.1, 0.01, "ijas owed 469.10");
  assertClose(
    ijasMoney!.netBalance,
    1876.4,
    0.01,
    "ijas net balance should be 1876.40"
  );

  const swalihMoney = ledger.find((l) => l.id === "1");
  assert(!!swalihMoney, "Should find swalih in ledger");
  assertClose(swalihMoney!.totalPaid, 0, 0.01, "swalih paid 0");
  assertClose(swalihMoney!.totalOwed, 469.1, 0.01, "swalih owed 469.10");
  assertClose(
    swalihMoney!.netBalance,
    -469.1,
    0.01,
    "swalih net balance should be -469.10"
  );

  // Verify total balances sum to 0
  const totalBalance = ledger.reduce((sum, entry) => sum + entry.netBalance, 0);
  assertClose(totalBalance, 0, 0.01, "Total balances should sum to 0");
} catch (e) {
  console.error("❌ Test failed:", e);
  process.exit(1);
}

// Test 7: Settlement generation
console.log("\n=== Test 7: Settlement Generation ===");
try {
  // Create a scenario where settlement is needed
  const ledger: ParticipantLedger[] = [
    {
      id: "1",
      name: "swalih",
      totalPaid: 1000,
      totalOwed: 200,
      netBalance: 800,
    },
    {
      id: "2",
      name: "ijas",
      totalPaid: 500,
      totalOwed: 1000,
      netBalance: -500,
    },
    {
      id: "3",
      name: "ameen",
      totalPaid: 300,
      totalOwed: 600,
      netBalance: -300,
    },
  ];

  const settlements = generateSettlement(ledger);

  assert(settlements.length > 0, "Should generate settlements");

  // Total to transfer should equal sum of positive balances
  const totalToTransfer = settlements.reduce((sum, s) => sum + s.amount, 0);
  const positiveBalance = ledger.reduce(
    (sum, l) => sum + Math.max(0, l.netBalance),
    0
  );
  assertClose(
    totalToTransfer,
    positiveBalance,
    0.01,
    "Transfer total should equal positive balances"
  );

  // Check settlement is minimal
  assert(
    settlements.length <= 2,
    "Settlement should be minimal (2 transactions for 3 people with debts)"
  );
} catch (e) {
  console.error("❌ Test failed:", e);
  process.exit(1);
}

// Test 8: Rounding accuracy
console.log("\n=== Test 8: Rounding Accuracy ===");
try {
  // Test case that requires careful rounding
  const calc = calculateExpenseSplit(
    100,
    "EQUAL",
    ["1", "2", "3"],
    {},
    undefined,
    undefined,
    undefined,
    undefined
  );

  const sum = Object.values(calc.shares).reduce((a, b) => a + b, 0);
  assertClose(sum, 100, 0.01, "Rounding should maintain exact total");

  // Each should be approximately 33.33
  Object.values(calc.shares).forEach((share) => {
    assert(
      share === 33.34 || share === 33.33,
      `Share should be 33.33 or 33.34, got ${share}`
    );
  });
} catch (e) {
  console.error("❌ Test failed:", e);
  process.exit(1);
}

// Test 9: Complex multi-expense scenario
console.log("\n=== Test 9: Complex Multi-Expense Scenario ===");
try {
  const expenses = [
    {
      id: "e1",
      payerId: "2",
      amount: 2345.5,
      taxPercent: 0,
      taxAbsolute: undefined,
      tipPercent: 0,
      tipAbsolute: undefined,
      splitType: "EQUAL",
      splitDetails: {},
    },
    {
      id: "e2",
      payerId: "3",
      amount: 8000,
      taxPercent: 0,
      taxAbsolute: undefined,
      tipPercent: 0,
      tipAbsolute: undefined,
      splitType: "EQUAL",
      splitDetails: {},
    },
  ];

  const participants = [
    { id: "1", name: "swalih" },
    { id: "2", name: "ijas" },
    { id: "3", name: "ameen" },
    { id: "4", name: "ameer" },
    { id: "5", name: "arshad ali" },
  ];

  const ledger = calculateLedger(expenses, participants);

  // Total spent
  const totalSpent = 2345.5 + 8000;
  const totalOwed = ledger.reduce((sum, l) => sum + l.totalOwed, 0);
  assertClose(
    totalOwed,
    totalSpent,
    0.01,
    "Total owed should equal total spent"
  );

  // Check balances sum to 0
  const totalBalance = ledger.reduce((sum, e) => sum + e.netBalance, 0);
  assertClose(totalBalance, 0, 0.01, "Total balances should sum to 0");
} catch (e) {
  console.error("❌ Test failed:", e);
  process.exit(1);
}

console.log("\n✅ All tests passed! 🎉");
