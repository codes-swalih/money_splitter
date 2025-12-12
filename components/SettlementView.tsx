'use client';

import React from 'react';
import { Settlement } from '@/lib/utils/calculations';

interface SettlementViewProps {
  settlements: Settlement[];
}

export default function SettlementView({ settlements }: SettlementViewProps) {
  if (settlements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">
          Settlement Needed
        </h2>
        <div className="text-center py-8 text-gray-500">
          Everyone is settled up!
        </div>
      </div>
    );
  }

  const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">
        Settlement Needed
      </h2>
      <div className="text-sm text-gray-600 mb-4">
        {settlements.length} transaction{settlements.length !== 1 ? 's' : ''} • Total:{' '}
        <span className="font-semibold text-gray-900">₹{totalAmount.toFixed(2)}</span>
      </div>

      <div className="space-y-3">
        {settlements.map((settlement, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 md:p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <div className="flex-1 flex items-center gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center font-semibold text-red-700 text-sm">
                {settlement.fromName.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-900 text-sm md:text-base">
                {settlement.fromName}
              </span>
            </div>

            <div className="flex items-center gap-2 mx-2 md:mx-4 shrink-0">
              <div className="shrink-0 text-green-600">→</div>
            </div>

            <div className="flex-1 flex items-center justify-end gap-3">
              <div className="text-right">
                <div className="font-bold text-green-600 text-sm md:text-base">
                  ₹{settlement.amount.toFixed(2)}
                </div>
              </div>
              <div className="shrink-0 w-9 h-9 rounded-full bg-green-100 flex items-center justify-center font-semibold text-green-700 text-sm">
                {settlement.toName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Tip:</span> These transactions settle all debts
          with the minimum number of transfers.
        </p>
      </div>
    </div>
  );
}
