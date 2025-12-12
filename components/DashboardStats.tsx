'use client';

import React from 'react';
import { ParticipantLedger } from '@/lib/utils/calculations';

interface DashboardStats {
  trip: any;
  expenses: any[];
  ledger: ParticipantLedger[];
}

export default function DashboardStats({ trip, expenses, ledger }: DashboardStats) {
  const totalCost = expenses.reduce((sum, e) => {
    const tax = e.taxPercent ? (e.amount * e.taxPercent) / 100 : 0;
    const tip = e.tipPercent ? (e.amount * e.tipPercent) / 100 : 0;
    return sum + e.amount + tax + tip;
  }, 0);

  const highestSpender = [...ledger].sort((a, b) => b.totalPaid - a.totalPaid)[0];
  const averagePerPerson = ledger.length > 0 ? totalCost / ledger.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Total Cost */}
      <div className="bg-blue-50 rounded-lg shadow-md p-4 md:p-6 border border-blue-200">
        <div className="text-gray-700 text-sm font-semibold mb-2">Total Trip Cost</div>
        <div className="text-3xl md:text-4xl font-bold text-blue-600">
          {trip.currency} {totalCost.toFixed(2)}
        </div>
        <div className="text-xs md:text-sm text-gray-600 mt-2">
          {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Highest Spender */}
      <div className="bg-purple-50 rounded-lg shadow-md p-4 md:p-6 border border-purple-200">
        <div className="text-gray-700 text-sm font-semibold mb-2">Highest Spender</div>
        <div className="text-xl md:text-2xl font-bold text-purple-600 truncate">
          {highestSpender?.name || 'N/A'}
        </div>
        <div className="text-lg md:text-xl font-semibold text-purple-700 mt-1">
          {trip.currency} {highestSpender?.totalPaid.toFixed(2) || '0.00'}
        </div>
      </div>

      {/* Average Per Person */}
      <div className="bg-green-50 rounded-lg shadow-md p-4 md:p-6 border border-green-200">
        <div className="text-gray-700 text-sm font-semibold mb-2">Avg per Person</div>
        <div className="text-3xl md:text-4xl font-bold text-green-600">
          {trip.currency} {averagePerPerson.toFixed(2)}
        </div>
        <div className="text-xs md:text-sm text-gray-600 mt-2">
          {ledger.length} participant{ledger.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
