"use client";

import React from "react";

interface TripStatsProps {
  expenses: Array<{
    _id: string;
    amount: number;
    category: string;
    payerId: string;
    date: string;
  }>;
  participants: Array<{ id: string; name: string }>;
  ledger: Array<{
    id: string;
    name: string;
    totalPaid: number;
    totalOwed: number;
    netBalance: number;
  }>;
}

export default function TripStats({
  expenses,
  participants,
  ledger,
}: TripStatsProps) {
  // Calculate stats
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageExpense =
    expenses.length > 0 ? totalExpenses / expenses.length : 0;

  // Category breakdown
  const categoryStats = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Who paid the most
  const payerStats = expenses.reduce((acc, exp) => {
    acc[exp.payerId] = (acc[exp.payerId] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const topPayers = Object.entries(payerStats)
    .map(([payerId, amount]) => ({
      name: participants.find((p) => p.id === payerId)?.name || "Unknown",
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Daily spending
  const dailyStats = expenses.reduce((acc, exp) => {
    const date = new Date(exp.date).toDateString();
    acc[date] = (acc[date] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const busiestDay = Object.entries(dailyStats).sort(
    ([, a], [, b]) => b - a
  )[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">
        Trip Insights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Expenses */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            ₹{totalExpenses.toFixed(2)}
          </div>
          <div className="text-sm text-blue-800">Total Spent</div>
        </div>

        {/* Average Expense */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600 mb-1">
            ₹{averageExpense.toFixed(2)}
          </div>
          <div className="text-sm text-green-800">Average per Expense</div>
        </div>

        {/* Number of Expenses */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {expenses.length}
          </div>
          <div className="text-sm text-purple-800">Total Expenses</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Top Categories
          </h3>
          <div className="space-y-2">
            {topCategories.map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">{category}</span>
                <span className="font-semibold text-gray-900">
                  ₹{amount.toFixed(2)}
                </span>
              </div>
            ))}
            {topCategories.length === 0 && (
              <p className="text-sm text-gray-500">No expenses yet</p>
            )}
          </div>
        </div>

        {/* Top Contributors */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Top Contributors
          </h3>
          <div className="space-y-2">
            {topPayers.map((payer) => (
              <div
                key={payer.name}
                className="flex justify-between items-center"
              >
                <span className="text-gray-700">{payer.name}</span>
                <span className="font-semibold text-gray-900">
                  ₹{payer.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {topPayers.length === 0 && (
              <p className="text-sm text-gray-500">No expenses yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Busiest Day */}
      {busiestDay && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">📅</span>
            <div>
              <div className="font-semibold text-yellow-800">
                Busiest Spending Day
              </div>
              <div className="text-sm text-yellow-700">
                {busiestDay[0]} • ₹{busiestDay[1].toFixed(2)} spent
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Summary */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          Balance Summary
        </h3>
        <div className="space-y-2">
          {ledger
            .sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance))
            .slice(0, 5)
            .map((person) => (
              <div
                key={person.id}
                className="flex justify-between items-center"
              >
                <span className="text-gray-700">{person.name}</span>
                <span
                  className={`font-semibold ${
                    person.netBalance > 0.01
                      ? "text-green-600"
                      : person.netBalance < -0.01
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {person.netBalance > 0.01 ? "+" : ""}₹
                  {person.netBalance.toFixed(2)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
