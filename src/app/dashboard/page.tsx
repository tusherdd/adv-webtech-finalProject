"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type User = {
  sub: number;
  email: string;
  role: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getProfile() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:3001/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setUser(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Something went wrong");
        }

        localStorage.removeItem("access_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Loading your dashboard...</p>
      </main>
    );
  }

  const role = user?.role || "CUSTOMER";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.email.split("@")[0]}!
              </h1>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                {role}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Select an option below to manage parking, reservations, or system features.
            </p>
          </div>

          <Link
            href="/profile"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3.5 py-2 rounded transition"
          >
            Edit Profile
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm">
            {error}
          </div>
        )}

        {/* CUSTOMER PORTAL */}
        {role === "CUSTOMER" && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Customer Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/parking"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  Find & Reserve Parking
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Search nearby parking lots, check real-time slot availability, and reserve.
                </p>
              </Link>

              <Link
                href="/reservations"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  My Reservations
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  View your generated parking entry codes, check-in status, and cancellation.
                </p>
              </Link>

              <Link
                href="/payments"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  Payment Records
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Review invoice history, paid timestamps, and payment receipts.
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* PARKING MANAGER PORTAL */}
        {role === "PARKING_MANAGER" && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Parking Manager Controls
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/manager/parking"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  Manage My Parking Locations
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Add new facilities, update capacity & hourly prices, or remove locations.
                </p>
              </Link>

              <Link
                href="/parking"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  Public Parking Directory
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  See how parking lots and slot availability appear to customers.
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* PARKING ATTENDANT PORTAL */}
        {role === "PARKING_ATTENDANT" && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Attendant Operations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/attendant"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  Code Verification & Check-In / Out
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Verify customer reservation codes, stamp check-in, and process vehicle exit.
                </p>
              </Link>

              <Link
                href="/parking"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  Parking Lots Overview
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Monitor capacity and available spaces across lots.
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* ADMIN PORTAL */}
        {role === "ADMIN" && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Platform Administration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/admin/dashboard"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  System Overview
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Revenue statistics, active reservations, and user distribution.
                </p>
              </Link>

              <Link
                href="/admin/users"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  User Management
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Search users, change roles, and manage permissions.
                </p>
              </Link>

              <Link
                href="/parking"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  Parking Lots
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  View and inspect all active parking lots on the platform.
                </p>
              </Link>

              <Link
                href="/admin/payments"
                className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow transition group"
              >
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                  System Payments
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Audit all payment transactions across all users.
                </p>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}