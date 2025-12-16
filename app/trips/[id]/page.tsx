"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import TripHeader from "@/components/TripHeader";
import ParticipantList from "@/components/ParticipantList";
import ExpenseModal from "@/components/ExpenseModal";
import ExpenseList from "@/components/ExpenseList";
import SettlementView from "@/components/SettlementView";
import TripEditModal from "@/components/TripEditModal";
import SettlementHistory from "@/components/SettlementHistory";
import TripStats from "@/components/TripStats";
import { ParticipantLedger, Settlement } from "@/lib/utils/calculations";
import { downloadCSV, generateCSVExport } from "@/lib/utils/export";
import DashboardStats from "@/components/DashboardStats";
import Link from "next/link";

interface Expense {
  _id: string;
  tripId: string;
  amount: number;
  currency: string;
  payerId: string;
  date: string;
  category: string;
  description: string;
  receiptUrl?: string;
  tax?: number;
  taxPercent?: number;
  tip?: number;
  tipPercent?: number;
  splitType: string;
  splitDetails: Record<string, number>;
}

interface Trip {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  currency: string;
  participants: Array<{ id: string; name: string; avatarUrl?: string }>;
  ownerId: string;
}

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ledger, setLedger] = useState<ParticipantLedger[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [recordedSettlements, setRecordedSettlements] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/trips/${tripId}`);
      if (res.ok) {
        const data = await res.json();
        setTrip(data.trip);
        setExpenses(data.expenses);
        setLedger(data.ledger);
        setSettlements(data.settlements);
        setRecordedSettlements(data.recordedSettlements || []);
      } else {
        alert("Trip not found");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      alert("Error loading trip");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });

      if (res.ok) {
        await fetchTripData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add expense");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Error adding expense");
    }
  };

  const handleEditExpense = async (expenseData: any) => {
    if (!editingExpense) return;

    try {
      const res = await fetch(
        `/api/trips/${tripId}/expenses/${editingExpense._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expenseData),
        }
      );

      if (res.ok) {
        setEditingExpense(null);
        await fetchTripData();
      } else {
        alert("Failed to update expense");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Error updating expense");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const res = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchTripData();
      } else {
        alert("Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Error deleting expense");
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/export?format=csv`);
      if (res.ok) {
        const csv = await res.text();
        downloadCSV(csv, `trip-${trip?.title}-${Date.now()}.csv`);
      }
    } catch (error) {
      alert("Error exporting trip");
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/trips/${tripId}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Trip link copied to clipboard!");
  };

  const handleEditTrip = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveTrip = async (updatedTripData: any) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTripData),
      });

      if (res.ok) {
        await fetchTripData();
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to update trip");
      }
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    }
  };

  const handleDeleteTrip = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this trip? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/");
      } else {
        alert("Failed to delete trip");
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Error deleting trip");
    }
  };

  const filteredExpenses = expenses.filter((e) =>
    filter === ""
      ? true
      : filter === "category"
      ? e.category.toLowerCase().includes("")
      : true
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">⏳</div>
          <p className="text-gray-600 text-lg">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-600 mb-4">404</div>
          <p className="text-gray-600 mb-6">Trip not found</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TripHeader
        title={trip.title}
        startDate={trip.startDate}
        endDate={trip.endDate}
        currency={trip.currency}
        onExport={handleExport}
        onShare={handleShare}
        onEdit={handleEditTrip}
        onDelete={handleDeleteTrip}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Dashboard Stats */}
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
          className="w-full mb-5 md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
        >
          + Add Expense
        </button>
        <div className="mb-6 md:mb-8">
          <DashboardStats trip={trip} expenses={expenses} ledger={ledger} />
        </div>

        {/* Trip Stats */}
        {/* <div className="mb-6 md:mb-8">
          <TripStats
            expenses={expenses}
            participants={trip.participants}
            ledger={ledger}
          />
        </div> */}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Participants */}
          <div className="lg:col-span-1">
            <ParticipantList participants={trip.participants} ledger={ledger} />
          </div>

          {/* Right Column - Expenses & Settlement */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Add Expense Button */}

            {/* Expense List */}
            <ExpenseList
              expenses={expenses}
              participants={trip.participants}
              onEdit={(expense) => {
                setEditingExpense(expense);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteExpense}
              currency={trip.currency}
            />

            {/* Settlement */}
            <SettlementView
              settlements={settlements}
              tripId={tripId}
              onSettleComplete={() => fetchTripData()}
            />

            {/* Settlement History */}
            <SettlementHistory
              settlements={recordedSettlements}
              participants={trip.participants}
            />
          </div>
        </div>
      </main>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
        participants={trip.participants}
        editingExpense={editingExpense}
        currency={trip.currency}
      />

      {/* Trip Edit Modal */}
      <TripEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        trip={trip}
        onSave={handleSaveTrip}
      />
    </div>
  );
}
