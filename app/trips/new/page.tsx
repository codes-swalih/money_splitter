"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { id } from "date-fns/locale";

const DEFAULT_PARTICIPANTS = [
  // { id: "1", name: "swalih" },
  // { id: "2", name: "ijas" },
  // { id: "3", name: "ameen" },
  // { id: "4", name: "ameer" },
  // { id: "5", name: "arshad ali" },
  {id: "1", name: "John" },
];

export default function NewTripPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [currency, setCurrency] = useState("INR");
  const [participants, setParticipants] = useState(DEFAULT_PARTICIPANTS);
  const [newParticipant, setNewParticipant] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      setParticipants([
        ...participants,
        { id: Date.now().toString(), name: newParticipant.trim() },
      ]);
      setNewParticipant("");
    }
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          startDate,
          endDate,
          currency,
          participants: participants.map((p) => ({
            ...p,
            avatarUrl: undefined,
            email: undefined,
          })),
          ownerId: "user-1",
        }),
      });

      if (res.ok) {
        const trip = await res.json();
        router.push(`/trips/${trip._id}`);
      } else {
        alert("Failed to create trip");
      }
    } catch (error) {
      alert("Error creating trip");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <span>←</span>
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Create New Trip
          </h1>
          <p className="text-gray-600 mb-8">
            Set up a new trip and invite your friends
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 text-black">
            {/* Trip Title */}
            <div className="text-black">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trip Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Goa Trip 2024"
              />
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Participants */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Participants ({participants.length})
              </h3>

              <div className="space-y-2 mb-4">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-900 font-medium">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p.id)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 text-black">
                <input
                  type="text"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddParticipant();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add participant name"
                />
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                disabled={loading || !title || participants.length < 2}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-base"
              >
                {loading ? "Creating..." : "Create Trip"}
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
