"use client";

import React from "react";
import { ParticipantLedger } from "@/lib/utils/calculations";

interface ParticipantListProps {
  participants: Array<{ id: string; name: string; avatarUrl?: string }>;
  ledger: ParticipantLedger[];
}

export default function ParticipantList({
  participants,
  ledger,
}: ParticipantListProps) {
  const getNetBalance = (id: string) => {
    return ledger.find((l) => l.id === id)?.netBalance || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">
        Participants
      </h2>
      <div className="space-y-1">
        {participants.map((participant) => {
          const balance = getNetBalance(participant.id);
          const isCreditor = balance > 0.01;
          const isDebtor = balance < -0.01;

          return (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                    {participant.name}
                  </p>
                </div>
              </div>

              <div
                className={`text-right font-bold text-sm md:text-base ml-2 shrink-0 ${
                  isCreditor
                    ? "text-green-600"
                    : isDebtor
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                <div
                  className={
                    isCreditor
                      ? "text-green-600"
                      : isDebtor
                      ? "text-red-600"
                      : "text-gray-400"
                  }
                >
                  {isCreditor ? "↓" : isDebtor ? "↑" : "−"}
                </div>
                <div className="text-xs md:text-sm">
                  {Math.abs(balance).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
