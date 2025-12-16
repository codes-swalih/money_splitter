"use client";

import React from "react";
import { format } from "date-fns";

interface RecordedSettlement {
  _id: string;
  fromId: string;
  toId: string;
  amount: number;
  settledAt: string;
  fromName?: string;
  toName?: string;
}

interface SettlementHistoryProps {
  settlements: RecordedSettlement[];
  participants: Array<{ id: string; name: string }>;
}

export default function SettlementHistory({
  settlements,
  participants,
}: SettlementHistoryProps) {
  const getParticipantName = (id: string) => {
    const participant = participants.find((p) => p.id === id);
    return participant?.name || "Unknown";
  };

  if (settlements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">
          Settlement History
        </h2>
        <div className="text-center py-8 text-gray-500">
          No settlements recorded yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">
        Settlement History
      </h2>

      <div className="space-y-3">
        {settlements.map((settlement) => (
          <div
            key={settlement._id}
            className="flex items-center justify-between p-3 md:p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-semibold text-green-700 text-sm">
                ✓
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm md:text-base">
                  {getParticipantName(settlement.fromId)} paid{" "}
                  {getParticipantName(settlement.toId)}
                </div>
                <div className="text-xs text-gray-500">
                  {format(
                    new Date(settlement.settledAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-green-600 text-sm md:text-base">
                ₹{settlement.amount.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Tip:</span> These are completed
          settlements. The current settlement suggestions above account for
          these payments.
        </p>
      </div>
    </div>
  );
}
