"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import PaymentModal from "@/components/PaymentModal";

type ReservationItem = {
  id: number;
  reservationCode: string;
  startTime: string;
  endTime: string;
  status: string;
  parking?: {
    id: number;
    parkingName: string;
    location: string;
    pricePerHour: number | string;
  };
  isPaid?: boolean;
};

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedResForPayment, setSelectedResForPayment] = useState<ReservationItem | null>(null);

  async function loadData() {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // 1. Fetch user's payments to get confirmed/paid reservations
      const payRes = await fetch("http://localhost:3001/payment/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items: ReservationItem[] = [];

      if (payRes.ok) {
        const payments = await payRes.json();
        if (Array.isArray(payments)) {
          payments.forEach((p: any) => {
            if (p.reservation) {
              items.push({
                ...p.reservation,
                isPaid: true,
              });
            }
          });
        }
      }

      setReservations(items);
    } catch (err: any) {
      setError(err.message || "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCancel(id: number) {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    setActionMessage("");
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/reservation/${id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel reservation");
      }

      setActionMessage("Reservation cancelled successfully.");
      // Update locally
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r))
      );
    } catch (err: any) {
      alert(err.message || "Error cancelling reservation");
    }
  }

  function openPayment(item: ReservationItem) {
    setSelectedResForPayment(item);
    setPaymentModalOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
            <p className="text-sm text-gray-600 mt-1">
              View your booking history, codes, and reservation status.
            </p>
          </div>

          <Link
            href="/parking"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition self-start sm:self-auto"
          >
            + Book New Slot
          </Link>
        </div>

        {actionMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">
            {actionMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-gray-500">Loading your reservations...</div>
        )}

        {!loading && reservations.length === 0 && (
          <div className="text-center bg-white border border-gray-200 rounded-lg py-16 px-4">
                        <h3 className="text-lg font-semibold text-gray-900">No Reservations Yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              You have not booked any parking slots yet.
            </p>
            <Link
              href="/parking"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded text-sm font-medium transition"
            >
              Explore Parking Locations
            </Link>
          </div>
        )}

        {!loading && reservations.length > 0 && (
          <div className="space-y-4">
            {reservations.map((item) => {
              const isActive = item.status === "ACTIVE";
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-gray-900">
                        {item.parking?.parkingName || "Parking Lot"}
                      </span>
                      <StatusBadge status={item.status} />
                      {item.isPaid && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                          PAID
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      {item.parking?.location || "Location provided"}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-1">
                      <div>
                        <span className="text-gray-400">Code: </span>
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {item.reservationCode}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Arrival: </span>
                        <span className="font-medium">
                          {new Date(item.startTime).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Departure: </span>
                        <span className="font-medium">
                          {new Date(item.endTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {!item.isPaid && isActive && (
                      <button
                        onClick={() => openPayment(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 rounded transition"
                      >
                        Pay Now
                      </button>
                    )}

                    {isActive && (
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="border border-red-300 text-red-600 hover:bg-red-50 text-xs font-medium px-3 py-1.5 rounded transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedResForPayment && (
        <PaymentModal
          isOpen={paymentModalOpen}
          reservationId={selectedResForPayment.id}
          amount={Number(selectedResForPayment.parking?.pricePerHour || 50)}
          parkingName={selectedResForPayment.parking?.parkingName}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      <Footer />
    </div>
  );
}