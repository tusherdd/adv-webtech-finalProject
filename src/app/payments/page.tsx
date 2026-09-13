"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";

type PaymentRecord = {
  id: number;
  amount: number | string;
  status: string;
  createdAt: string;
  reservation?: {
    id: number;
    reservationCode: string;
    startTime: string;
    endTime: string;
    parking?: {
      parkingName: string;
      location: string;
    };
  };
};

export default function MyPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPayments() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/payment/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load payment history");
        }

        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Failed to retrieve payment records.");
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, [router]);

  const totalSpent = payments.reduce(
    (acc, cur) => acc + Number(cur.amount || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review all completed and pending parking payment transactions.
          </p>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
              Total Transactions
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {payments.length}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
              Total Amount Paid
            </span>
            <span className="text-2xl font-bold text-blue-600">
              ৳{totalSpent}
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
            Loading payment records...
          </div>
        )}

        {!loading && payments.length === 0 && (
          <div className="text-center bg-white border border-gray-200 rounded-lg py-16 px-4">
                        <h3 className="text-lg font-semibold text-gray-900">No Payments Recorded</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              You have not made any payments yet.
            </p>
            <Link
              href="/parking"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded text-sm font-medium transition"
            >
              Book Parking
            </Link>
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Transaction ID</th>
                    <th className="px-6 py-3">Reservation Code</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">
                        #PAY-{p.id.toString().padStart(5, "0")}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-blue-600">
                        {p.reservation?.reservationCode || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ৳{Number(p.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
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