"use client";

import React from "react";
import { ParticipantLedger, isTripExpense } from "@/lib/utils/calculations";

interface DashboardStats {
  trip: any;
  expenses: any[];
  ledger: ParticipantLedger[];
}

export default function DashboardStats({
  trip,
  expenses,
  ledger,
}: DashboardStats) {
  // Add null checks
  if (!trip || !expenses || !ledger) {
    return <div>Loading...</div>;
  }

  const participantIds = trip.participants?.map((p: any) => p.id) || [];

  // Separate trip expenses from personal expenses
  const tripExpenses = expenses.filter((expense) =>
    isTripExpense(expense.splitType, expense.splitDetails, participantIds)
  );

  const personalExpenses = expenses.filter(
    (expense) =>
      !isTripExpense(expense.splitType, expense.splitDetails, participantIds)
  );

  const calculateTotal = (expenseList: any[]) => {
    return expenseList.reduce((sum, e) => {
      const tax = e.taxPercent ? (e.amount * e.taxPercent) / 100 : e.tax || 0;
      const tip = e.tipPercent ? (e.amount * e.tipPercent) / 100 : e.tip || 0;
      return sum + e.amount + tax + tip;
    }, 0);
  };

  const totalTripCost = calculateTotal(tripExpenses);
  const totalPersonalCost = calculateTotal(personalExpenses);
  const totalAllExpenses = totalTripCost + totalPersonalCost;

  const highestSpender = [...ledger].sort(
    (a, b) => b.totalPaid - a.totalPaid
  )[0];
  const averagePerPerson =
    ledger.length > 0 ? totalTripCost / ledger.length : 0;

  return (
    <div className="space-y-4">
      {/* Trip Expenses Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
        {/* Total Trip Cost */}
        <div className="bg-blue-50 rounded-lg shadow-md p-4 md:p-6 border border-blue-200">
          <div className="text-gray-700 text-sm font-semibold">
            Total Trip Cost
          </div>
          <div className="text-xl md:text-4xl font-bold text-blue-600">
            {trip.currency} {totalTripCost.toFixed(2)}
          </div>
          <div className="text-xs md:text-sm text-gray-600">
            {tripExpenses.length} trip expense
            {tripExpenses.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Personal Expenses */}
        <div className="bg-orange-50 rounded-lg shadow-md p-4 md:p-6 border border-orange-200">
          <div className="text-gray-700 text-sm font-semibold">
            Personal Expenses
          </div>
          <div className="text-xl md:text-4xl font-bold text-orange-600">
            {trip.currency} {totalPersonalCost.toFixed(2)}
          </div>
          <div className="text-xs md:text-sm text-gray-600">
            {personalExpenses.length} personal expense
            {personalExpenses.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Average Per Person */}
        <div className="bg-green-50 rounded-lg shadow-md p-4 md:p-6 border border-green-200">
          <div className="text-gray-700 text-sm font-semibold">
            Avg per Person
          </div>
          <div className="text-xl md:text-4xl font-bold text-green-600">
            {trip.currency} {averagePerPerson.toFixed(2)}
          </div>
          <div className="text-xs md:text-sm text-gray-600">
            {ledger.length} participant{ledger.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Highest Spender */}
      <div className="bg-purple-50 rounded-lg shadow-md p-4 md:p-6 border border-purple-200">
        <div className="text-gray-700 text-sm font-semibold">
          Highest Spender
        </div>
        <div className="text-xl md:text-2xl font-bold text-purple-600 truncate">
          {highestSpender?.name || "N/A"}
        </div>
        <div className="text-lg md:text-xl font-semibold text-purple-700">
          {trip.currency} {highestSpender?.totalPaid.toFixed(2) || "0.00"}
        </div>
        <div className="text-xs md:text-sm text-gray-600 mt-1">
          Total spent on trip expenses
        </div>
      </div>
    </div>
  );
}
