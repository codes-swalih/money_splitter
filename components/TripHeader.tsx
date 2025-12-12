"use client";

import React from "react";
import { format } from "date-fns";

interface TripHeaderProps {
  title: string;
  startDate: string | Date;
  endDate: string | Date;
  currency: string;
  onExport: () => void;
  onShare: () => void;
}

export default function TripHeader({
  title,
  startDate,
  endDate,
  currency,
  onExport,
  onShare,
}: TripHeaderProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    <div className="bg-blue-600 text-white px-4 py-6 md:px-6 md:py-8 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-blue-100">
              <span className="text-sm md:text-base">
                {format(start, "MMM d, yyyy")} - {format(end, "MMM d, yyyy")}
              </span>
              <span className="hidden sm:inline text-blue-300">•</span>
              <span className="text-sm md:text-base font-semibold">
                {currency}
              </span>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3 flex-wrap">
            <button
              onClick={onShare}
              className="flex items-center gap-2 bg-white text-blue-600 px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm md:text-base"
            >
              <span className=" sm:inline">Share</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-2 bg-blue-500 text-white px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors text-sm md:text-base"
            >
              <span className=" sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
