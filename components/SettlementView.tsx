"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { Settlement } from "@/lib/utils/calculations";

interface SettlementViewProps {
  settlements: Settlement[];
  tripId?: string;
  onSettleComplete?: () => void;
}

export default function SettlementView({
  settlements,
  tripId,
  onSettleComplete,
}: SettlementViewProps) {
  const [settledIndex, setSettledIndex] = useState<number | null>(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSettleClick = (idx: number, amount: number) => {
    setSettledIndex(idx);
    setSettleAmount(amount.toFixed(2));
  };

  const confirmSettle = async () => {
    if (!settleAmount) {
      toast.error("Please enter an amount");
      return;
    }

    if (!tripId) {
      toast.error("Trip ID not found");
      return;
    }

    setIsLoading(true);
    try {
      const settlement = settlements[settledIndex!];
      const res = await fetch(`/api/trips/${tripId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromId: settlement.from,
          toId: settlement.to,
          amount: parseFloat(settleAmount),
        }),
      });

      if (res.ok) {
        toast.success(`Settled ₹${settleAmount}! ✓`);
        setSettledIndex(null);
        setSettleAmount("");
        // Call refresh callback
        if (onSettleComplete) {
          onSettleComplete();
        }
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to settle");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to settle");
    } finally {
      setIsLoading(false);
    }
  };
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
        {settlements.length} transaction{settlements.length !== 1 ? "s" : ""} •
        Total:{" "}
        <span className="font-semibold text-gray-900">
          ₹{totalAmount.toFixed(2)}
        </span>
      </div>

      <div className="space-y-3">
        {settlements.map((settlement, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 md:p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <div className="flex-1 flex items-center gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center font-semibold text-red-700 text-sm">
                {settlement.fromName?.charAt(0).toUpperCase()}
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
              <div className="shrink-0 px-2 py-1 rounded-full bg-green-900 flex items-center justify-center font-medium text-white text-xs">
                {settlement.toName}
              </div>
              <button
                onClick={() => handleSettleClick(idx, settlement.amount)}
                className="shrink-0 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Settle
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Tip:</span> These transactions
          settle all debts with the minimum number of transfers.
        </p>
      </div>

      {/* Settle Modal */}
      {settledIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Confirm Settlement
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {settlements[settledIndex].fromName} pays{" "}
                  {settlements[settledIndex].toName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  disabled={isLoading}
                  className="form-input disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSettledIndex(null)}
                disabled={isLoading}
                className="btn-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSettle}
                disabled={isLoading}
                className="btn-success disabled:opacity-50"
              >
                {isLoading ? "Settling..." : "Settled"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
