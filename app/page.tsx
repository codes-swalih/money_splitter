"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import db from "@/assets/dp.jpeg";
import Image from "next/image";

const DEFAULT_PARTICIPANTS = [];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchTrips = async () => {
      try {
        // wait for auth check to finish
        if (authLoading) return;

        // if not authenticated, don't attempt fetching trips
        if (!user) {
          if (mounted) setTrips([]);
          return;
        }

        const res = await fetch("/api/trips");
        if (res.ok) {
          const data = await res.json();
          if (mounted) setTrips(data.trips || []);
        } else if (res.status === 401) {
          // unauthorized - clear trips
          if (mounted) setTrips([]);
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
      {/* Hero Section */}
      <header className="bg-linear-to-br from-blue-600 via-blue-700 to-blue-800 text-white px-4 py-5 md:px-6 md:py-16 shadow-lg">
        <div className="max-w-7xl mx-auto text-center">
          {/* <div className="w-20 h-20 md:w-24 md:h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl md:text-4xl">💰</span>
          </div> */}
          <h1 className="text-2xl md:text-5xl font-bold mb-2">
            Split Expenses with Ease
          </h1>
          <p className="text-blue-100 text- md:text-xl mb-5 md:mb-0  max-w-2xl mx-auto">
            Track shared expenses, calculate settlements, and keep your group
            trips fair and simple.
          </p>
          {user && (
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-2 md:py-4 rounded-md md:rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg text-lg"
            >
              <span className="md:text-2xl">+</span>
              Create New Trip
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 border-t-4 border-blue-600">
          {/* <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Welcome!
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-8">
            Trip Splitter helps you track shared expenses and calculate how much
            each person owes. Perfect for trips with friends, roommates, or any
            group that shares costs.
          </p> */}

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Features
              </h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Smart Expense Tracking
                    </div>
                    <div className="text-sm text-gray-600">
                      Track expenses with categories, receipts, and automatic
                      calculations
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Flexible Split Types
                    </div>
                    <div className="text-sm text-gray-600">
                      Equal splits, custom amounts, percentages, or select
                      specific people
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Settlement Tracking
                    </div>
                    <div className="text-sm text-gray-600">
                      Record payments and track who owes what with real-time
                      updates
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-600 font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Export & Share
                    </div>
                    <div className="text-sm text-gray-600">
                      Export as CSV, share trip links, and keep everyone in sync
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-8 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🚀 Get Started
              </h3>
              <p className="text-gray-700 mb-4 md:mb-6">
                {user
                  ? "Create your first trip and start splitting expenses with your group."
                  : "Join thousands of travelers who split expenses fairly and easily."}
              </p>
              {user ? (
                <Link
                  href="/trips/new"
                  className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-2 md:py-4 rounded-md md:rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg md:text-lg w-full justify-center"
                >
                  <span className="md:text-2xl">+</span>
                  Create New Trip
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-2 md:py-4 rounded-md md:rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg md:text-lg w-full"
                  >
                    Sign Up Free
                  </Link>
                  <div className="text-center text-sm">
                    <span className="text-gray-600">
                      Already have an account?{" "}
                    </span>
                    <Link
                      href="/auth/login"
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card-lg p-4 md:p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Your Trips
            </h3>
            {loadingTrips ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h4 className="md:text-lg font-semibold text-gray-900 mb-2">
                  No trips yet
                </h4>
                <p className="text-gray-600 mb-6">
                  {user
                    ? "Create your first trip to get started!"
                    : "Sign up to create your first trip!"}
                </p>
                {user && (
                  <Link
                    href="/trips/new"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <span>+</span>
                    Create Trip
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((t) => (
                  <Link
                    key={t._id}
                    href={`/trips/${t._id}`}
                    className="block p-3 md:p-6 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {/* <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <span className="text-blue-600 font-semibold text-sm">
                              {t.title.charAt(0).toUpperCase()}
                            </span>
                          </div> */}
                          <div>
                            <div className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                              {t.title}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-4">
                              <span className="flex items-center gap-1">
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
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {new Date(t.startDate).toLocaleDateString()} -{" "}
                                {/* {new Date(t.endDate).toLocaleDateString()} */}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                          {t.participants?.length || 0} people
                        </div>
                        {/* <div className="text-sm font-medium text-blue-600">
                          {t.currency}
                        </div> */}
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
      <footer className="bg-gray-900 text-gray-300 text-center py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">₹</span>
            </div>
            <span className="font-semibold text-white">
              Panchayath Trip Splitter
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Built with ❤️ for fair expense sharing
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <span>Secure</span>
            <span>•</span>
            <span>Private</span>
            <span>•</span>
            <span>Free</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
