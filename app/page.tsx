"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import db from "@/assets/dp.jpeg";
import Image from "next/image";

const DEFAULT_PARTICIPANTS = [
  { id: "1", name: "swalih" },
  { id: "2", name: "ijas" },
  { id: "3", name: "ameen" },
  { id: "4", name: "ameer" },
  { id: "5", name: "arshad ali" },
];

export default function Home() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchTrips = async () => {
      try {
        const res = await fetch("/api/trips?ownerId=user-1");
        if (res.ok) {
          const data = await res.json();
          if (mounted) setTrips(data.trips || []);
        } else {
          console.warn("Failed to load trips");
        }
      } catch (e) {
        console.error("Error fetching trips:", e);
      } finally {
        if (mounted) setLoadingTrips(false);
      }
    };

    fetchTrips();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-6 md:px-6 md:py-8 shadow-lg">
        <div className=" flex flex-col items-center">
          <div className=" w-24 h-24 rounded-b-full">
            <Image
              src={db}
              alt=""
              className="w-full h-full object-cover rounded-full"
              width={100}
              height={100}
            />
          </div>
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl md:text-5xl font-bold mb-2">
              Panchayath Trip Splitter
            </h1>
            <p className="text-blue-100 text-base md:text-lg">
              Split expenses and settle up with your group
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 border-t-4 border-blue-600">
          {/* <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Welcome!
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-8">
            Trip Splitter helps you track shared expenses and calculate how much
            each person owes. Perfect for trips with friends, roommates, or any
            group that shares costs.
          </p> */}

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Features</h3>
              <ul className="space-y-2 text-gray-700 text-sm md:text-base">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Create trips with multiple participants</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Track expenses with categories and dates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Multiple split types (equal, custom, percentage)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Automatic settlement calculations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>Export as CSV</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 md:p-8 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Get Started
              </h3>
              <p className="text-gray-700 mb-6">
                Create your first trip now. You can add expenses, track who paid
                what, and see exactly who owes whom.
              </p>
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
              >
                <span className="text-lg">+</span>
                <span>Create New Trip</span>
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              Pre-filled Participants
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              New trips come with these participants pre-filled (you can modify
              them):
            </p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_PARTICIPANTS.map((p) => (
                <span
                  key={p.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Your Trips</h3>
            {loadingTrips ? (
              <p className="text-sm text-gray-600">Loading your trips…</p>
            ) : trips.length === 0 ? (
              <p className="text-sm text-gray-600">
                You have no trips yet. Create one to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {trips.map((t) => (
                  <Link
                    key={t._id}
                    href={`/trips/${t._id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {t.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(t.startDate).toLocaleDateString()} –{" "}
                          {new Date(t.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {t.participants?.length || 0} people
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-6 mt-12">
        <p className="text-sm">Developed By Codes swalih</p>
      </footer>
    </div>
  );
}
