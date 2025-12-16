"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Trip {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  currency: string;
  participants: Participant[];
}

interface TripEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  onSave: (updatedTrip: Partial<Trip>) => Promise<void>;
}

export default function TripEditModal({
  isOpen,
  onClose,
  trip,
  onSave,
}: TripEditModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    currency: "INR",
  });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (trip && isOpen) {
      setFormData({
        title: trip.title,
        startDate: trip.startDate.split("T")[0], // Convert to YYYY-MM-DD
        endDate: trip.endDate.split("T")[0],
        currency: trip.currency,
      });
      setParticipants([...trip.participants]);
    }
  }, [trip, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Trip title is required");
      return;
    }

    if (participants.length === 0) {
      toast.error("At least one participant is required");
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        participants,
      });
      toast.success("Trip updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update trip");
    } finally {
      setIsLoading(false);
    }
  };

  const addParticipant = () => {
    if (!newParticipant.trim()) return;

    const participant: Participant = {
      id: Date.now().toString(),
      name: newParticipant.trim(),
    };

    setParticipants([...participants, participant]);
    setNewParticipant("");
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const updateParticipant = (id: string, name: string) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Trip</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter trip title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participants *
            </label>

            {/* Add Participant */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addParticipant())
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter participant name"
              />
              <button
                type="button"
                onClick={addParticipant}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add
              </button>
            </div>

            {/* Participant List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <input
                    type="text"
                    value={participant.name}
                    onChange={(e) =>
                      updateParticipant(participant.id, e.target.value)
                    }
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                  />
                  <button
                    type="button"
                    onClick={() => removeParticipant(participant.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    disabled={participants.length === 1}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {participants.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Add at least one participant to continue
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
