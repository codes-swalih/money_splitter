'use client';

import React from 'react';

interface Expense {
  _id: string;
  payerId: string;
  category: string;
  amount: number;
  date: string | Date;
  description: string;
  taxPercent?: number;
  tipPercent?: number;
}

interface ExpenseListProps {
  expenses: Expense[];
  participants: Array<{ id: string; name: string }>;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  currency: string;
}

export default function ExpenseList({
  expenses,
  participants,
  onEdit,
  onDelete,
  currency,
}: ExpenseListProps) {
  const getParticipantName = (id: string) => {
    return participants.find((p) => p.id === id)?.name || id;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: 'bg-orange-100 text-orange-800',
      Accommodation: 'bg-purple-100 text-purple-800',
      Transport: 'bg-blue-100 text-blue-800',
      Activities: 'bg-pink-100 text-pink-800',
      Shopping: 'bg-yellow-100 text-yellow-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.Other;
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">
          Expenses
        </h2>
        <div className="text-center py-8 text-gray-500">
          No expenses yet. Add one to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">
        Expenses ({expenses.length})
      </h2>

      <div className="overflow-x-auto">
        <div className="space-y-2 md:space-y-3">
          {expenses.map((expense) => {
            const total =
              expense.amount +
              (expense.taxPercent ? (expense.amount * expense.taxPercent) / 100 : 0) +
              (expense.tipPercent ? (expense.amount * expense.tipPercent) / 100 : 0);

            return (
              <div
                key={expense._id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2 items-center">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${getCategoryColor(
                        expense.category
                      )}`}
                    >
                      {expense.category}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                    {expense.description || 'No description'}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    Paid by {getParticipantName(expense.payerId)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm md:text-base">
                      {currency} {total.toFixed(2)}
                    </div>
                    {(expense.taxPercent || expense.tipPercent) && (
                      <div className="text-xs text-gray-600">
                        {expense.taxPercent && `+${expense.taxPercent}% tax`}
                        {expense.taxPercent && expense.tipPercent && ', '}
                        {expense.tipPercent && `+${expense.tipPercent}% tip`}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-1 md:p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                      title="Edit"
                    >
                      <span className="md:w-5 md:h-5">✏️</span>
                    </button>
                    <button
                      onClick={() => onDelete(expense._id)}
                      className="p-1 md:p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <span className="md:w-5 md:h-5">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
