"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";

type AllPaymentRecord = {
  id: number;
  amount: number | string;
  status: string;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };
  reservation?: {
    id: number;
    reservationCode: string;
    parking?: {
      parkingName: string;
      location: string;
    };
  };
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<AllPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAllPayments() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/payment", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Admin access required or unauthorized");
        }

        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Failed to load payment logs");
      } finally {
        setLoading(false);
      }
    }

    loadAllPayments();
  }, [router]);

  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((acc, cur) => acc + Number(cur.amount || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Transactions</h1>
          
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
              Total Invoices
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {payments.length}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
              Paid Invoices
            </span>
            <span className="text-2xl font-bold text-green-600">
              {payments.filter((p) => p.status === "PAID").length}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
              Total Revenue Collected
            </span>
            <span className="text-2xl font-bold text-blue-600">
              ৳{totalRevenue}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-gray-500">
            Loading system transactions...
          </div>
        )}

        {!loading && payments.length === 0 && (
          <div className="text-center bg-white border border-gray-200 rounded-lg py-16 text-gray-500">
            No transactions found in the database.
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Transaction</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Parking Spot</th>
                    <th className="px-6 py-3">Reservation Code</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        #PAY-{p.id.toString().padStart(5, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-xs">
                          {p.user?.fullName || "Unknown"}
                        </div>
                        <div className="text-gray-500 text-xs">{p.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700">
                        {p.reservation?.parking?.parkingName || "General Parking"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">
                        {p.reservation?.reservationCode || "N/A"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 text-xs">
                        ৳{Number(p.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}