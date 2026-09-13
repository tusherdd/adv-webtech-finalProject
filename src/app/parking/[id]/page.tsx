"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentModal from "@/components/PaymentModal";

type ParkingDetail = {
  id: number;
  parkingName: string;
  location: string;
  description?: string;
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number | string;
  owner?: {
    id: number;
    fullName?: string;
    email?: string;
  };
};

type CreatedReservation = {
  id: number;
  reservationCode: string;
  startTime: string;
  endTime: string;
  status: string;
};

export default function ParkingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const parkingId = resolvedParams.id;
  const router = useRouter();

  const [parking, setParking] = useState<ParkingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reservation form state
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [createdReservation, setCreatedReservation] = useState<CreatedReservation | null>(null);

  // Payment Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    async function loadParking() {
      try {
        const res = await fetch(`http://localhost:3001/parking/${parkingId}`);
        if (!res.ok) {
          throw new Error("Parking spot not found");
        }
        const data = await res.json();
        setParking(data);
      } catch (err: any) {
        setError(err.message || "Failed to load parking spot");
      } finally {
        setLoading(false);
      }
    }

    loadParking();
  }, [parkingId]);

  async function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    setBookingError("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!startTime || !endTime) {
      setBookingError("Please select both start and end time.");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setBookingError("End time must be after start time.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:3001/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parkingId: Number(parkingId),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Reservation failed"
        );
      }

      setCreatedReservation(data);

      // Refresh parking slots count
      if (parking) {
        setParking({
          ...parking,
          availableSlots: Math.max(0, parking.availableSlots - 1),
        });
      }
    } catch (err: any) {
      setBookingError(err.message || "Failed to reserve parking slot.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-auto mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/parking"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline mb-6"
        >
          ← Back to All Parking Lots
        </Link>

        {loading && (
          <div className="text-center py-16 text-gray-500">Loading details...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm mb-6">
            {error}
          </div>
        )}

        {!loading && parking && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Parking Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {parking.parkingName}
                  </h1>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                      Number(parking.availableSlots) > 0
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {parking.availableSlots} Slots Available
                  </span>
                </div>

                <p className="text-gray-600 text-sm flex items-center gap-1 mb-4">
                  {parking.location}
                </p>

                {parking.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      Description
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {parking.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                  <div>
                    <span className="text-xs text-gray-500 block">Rate</span>
                    <span className="text-lg font-bold text-blue-600">
                      ৳{Number(parking.pricePerHour)}
                    </span>
                    <span className="text-xs text-gray-400 block">/ hour</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Available</span>
                    <span className="text-lg font-bold text-green-600">
                      {parking.availableSlots}
                    </span>
                    <span className="text-xs text-gray-400 block">slots</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Capacity</span>
                    <span className="text-lg font-bold text-gray-800">
                      {parking.totalSlots}
                    </span>
                    <span className="text-xs text-gray-400 block">total</span>
                  </div>
                </div>

                {parking.owner && (
                  <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    Managed by: <span className="font-medium text-gray-700">{parking.owner.fullName || parking.owner.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Booking Form & Confirmation */}
            <div className="space-y-6">
              {/* Success Card */}
              {createdReservation ? (
                <div className="bg-white border-2 border-green-500 rounded-lg p-6 shadow-sm">
                  <div className="text-center mb-4">
                                        <h2 className="text-lg font-bold text-green-700 mt-2">
                      Reservation Confirmed!
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Please show this code to the attendant upon entry:
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 text-center p-3 rounded mb-4">
                    <span className="text-xs text-gray-500 block">Reservation Code</span>
                    <span className="text-2xl font-mono font-bold text-blue-700 tracking-wider">
                      {createdReservation.reservationCode}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setPaymentModalOpen(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded text-sm transition"
                    >
                      Pay Now (৳{Number(parking.pricePerHour)})
                    </button>

                    <Link
                      href="/reservations"
                      className="w-full block text-center border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded text-sm transition"
                    >
                      View All Reservations
                    </Link>
                  </div>
                </div>
              ) : (
                /* Booking Form */
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Book a Parking Space
                  </h2>

                  {bookingError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded text-xs">
                      {bookingError}
                    </div>
                  )}

                  <form onSubmit={handleReserve} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Arrival Time
                      </label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="w-full border border-gray-300 p-2 rounded text-sm text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Departure Time
                      </label>
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="w-full border border-gray-300 p-2 rounded text-sm text-gray-900"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting || Number(parking.availableSlots) <= 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded text-sm transition disabled:bg-gray-300"
                      >
                        {submitting
                          ? "Booking slot..."
                          : Number(parking.availableSlots) <= 0
                          ? "Parking is Full"
                          : "Confirm Reservation"}
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                      Payment can be made instantly online or upon arrival.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {createdReservation && parking && (
        <PaymentModal
          isOpen={paymentModalOpen}
          reservationId={createdReservation.id}
          amount={Number(parking.pricePerHour)}
          parkingName={parking.parkingName}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => {
            router.push("/payments");
          }}
        />
      )}

      <Footer />
    </div>
  );
}