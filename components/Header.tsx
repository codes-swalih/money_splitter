"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import toast from "react-hot-toast";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setShowLogoutModal(false);
      router.push("/auth/login");
    } catch (err) {
      toast.error("Failed to logout");
    }
  };

  return (
    <>
      <header className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 py-3 md:px-6 md:py-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-lg md:text-xl flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold">💰</span>
            </div>
            <span className="hidden sm:inline">Panchayath Trip Splitter</span>
            <span className="sm:hidden">snowsplit</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 spinner"></div>
            ) : user ? (
              <>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                  <div className="avatar text-sm">
                    {user?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="text-sm font-medium">
                    {user?.name || "User"}
                  </span>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            {loading ? (
              <div className="w-6 h-6 spinner"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="avatar text-xs">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden duration-100 mt-4 pb-4 border-t border-white/20 pt-4">
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <div className="avatar text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="font-medium">{user?.name || "User"}</div>
                      <div className="text-xs text-blue-100">Logged in</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="btn-secondary w-full justify-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary w-full text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {/* {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-4">
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="avatar text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="font-medium">{user?.name || "User"}</div>
                      <div className="text-xs text-gray-500">Logged in</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="btn-secondary w-full justify-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary w-full text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )} */}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6 text-balance">
              Are you sure you want to logout? You will need to login again to
              access your trips.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleLogout} className="btn-danger">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
