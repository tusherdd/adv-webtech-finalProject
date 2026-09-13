"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type DashboardStats = {
  totalUsers: number;
  totalParkingManagers: number;
  totalParkingAttendants: number;
  totalCustomers: number;
  totalParkings: number;
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  totalRevenue: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Admin access required or unauthorized");
        }

        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/users"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/payments"
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded transition"
            >
              View Payments
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-gray-500">
            Loading administrative overview...
          </div>
        )}

        {!loading && stats && (
          <div className="space-y-8">
            {/* 4 Main Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Total Revenue
                </span>
                <span className="text-3xl font-bold text-blue-600">
                  ৳{stats.totalRevenue}
                </span>
               
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Total Users
                </span>
                <span className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers}
                </span>
                
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Parking Locations
                </span>
                <span className="text-3xl font-bold text-gray-900">
                  {stats.totalParkings}
                </span>
                
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Active Bookings
                </span>
                <span className="text-3xl font-bold text-green-600">
                  {stats.activeReservations}
                </span>
                
              </div>
            </div>

            {/* 3 Detailed Breakdown Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
                  <span>User Distribution</span>
                  <Link
                    href="/admin/users"
                    className="text-xs text-blue-600 hover:underline font-normal"
                  >
                    View All →
                  </Link>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Customers</span>
                    <span className="font-semibold text-gray-900">
                      {stats.totalCustomers}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Parking Managers</span>
                    <span className="font-semibold text-gray-900">
                      {stats.totalParkingManagers}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Parking Attendants</span>
                    <span className="font-semibold text-gray-900">
                      {stats.totalParkingAttendants}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reservations Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  Reservations Breakdown
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Active Bookings</span>
                    <span className="font-semibold text-green-600">
                      {stats.activeReservations}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Completed Trips</span>
                    <span className="font-semibold text-blue-600">
                      {stats.completedReservations}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Cancelled</span>
                    <span className="font-semibold text-red-600">
                      {stats.cancelledReservations}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payments Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
                  <span>Transactions</span>
                  <Link
                    href="/admin/payments"
                    className="text-xs text-blue-600 hover:underline font-normal"
                  >
                    View All →
                  </Link>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Paid Invoices</span>
                    <span className="font-semibold text-green-600">
                      {stats.paidPayments}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Pending Invoices</span>
                    <span className="font-semibold text-yellow-600">
                      {stats.pendingPayments}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Total Count</span>
                    <span className="font-semibold text-gray-900">
                      {stats.totalPayments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}