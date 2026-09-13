"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";

type VerificationResult = {
  id: number;
  reservationCode: string;
  startTime: string;
  endTime: string;
  status: string;
  parking?: {
    parkingName: string;
    location: string;
  };
  user?: {
    fullName: string;
    email: string;
    phone: string;
  };
};

export default function AttendantPage() {
  const [reservationCode, setReservationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [recentLogs, setRecentLogs] = useState<{
    code: string;
    action: "Check-In" | "Check-Out";
    time: string;
  }[]>([]);

  async function handleAction(actionType: "check-in" | "check-out") {
    if (!reservationCode.trim()) {
      setError("Please enter a valid reservation code.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Attendant session expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const endpoint =
        actionType === "check-in"
          ? "http://localhost:3001/reservation/check-in"
          : "http://localhost:3001/reservation/check-out";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reservationCode: reservationCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Operation failed"
        );
      }

      setSuccessMsg(data.message || `Successfully completed ${actionType}`);
      if (data.reservation) {
        setResult(data.reservation);
      }

      setRecentLogs((prev) => [
        {
          code: reservationCode.trim().toUpperCase(),
          action: actionType === "check-in" ? "Check-In" : "Check-Out",
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 9),
      ]);

      setReservationCode("");
    } catch (err: any) {
      setError(err.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900">
            Attendant Operations Desk
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Verify reservation codes and manage physical vehicle entry and exit.
          </p>
        </div>

        {/* Verification Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Enter Reservation Code
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Type the 6-character code presented by the driver (e.g. RSV-ABC123).
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. RSV-8K2Q1M"
              value={reservationCode}
              onChange={(e) => setReservationCode(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-300 rounded p-2.5 font-mono text-base font-bold text-gray-900 uppercase tracking-widest placeholder:normal-case placeholder:font-normal"
            />

            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction("check-in")}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded text-sm transition disabled:bg-gray-300"
              >
                {loading ? "..." : "Check-In"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction("check-out")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded text-sm transition disabled:bg-gray-300"
              >
                {loading ? "..." : "Check-Out"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">
              {successMsg}
            </div>
          )}
        </div>

        {/* Live Result Details */}
        {result && (
          <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">
                Reservation Verified Details
              </h3>
              <StatusBadge status={result.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-400 block mb-1">Reservation Code</span>
                <span className="font-mono text-base font-bold text-blue-700">
                  {result.reservationCode}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-400 block mb-1">Parking Facility</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {result.parking?.parkingName || "General Parking"}
                </span>
                <p className="text-gray-500 mt-0.5">{result.parking?.location}</p>
              </div>

              {result.user && (
                <div className="bg-gray-50 p-3 rounded sm:col-span-2">
                  <span className="text-gray-400 block mb-1">Driver Information</span>
                  <p className="font-semibold text-gray-900 text-sm">
                    {result.user.fullName}
                  </p>
                  <p className="text-gray-500">
                    Phone: {result.user.phone} | Email: {result.user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Session Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Recent Desk Actions
          </h3>

          {recentLogs.length === 0 ? (
            <p className="text-xs text-gray-400">
              No check-ins or check-outs processed in this session yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="py-2 flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded ${
                        log.action === "Check-In"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-mono font-medium text-gray-800">
                      {log.code}
                    </span>
                  </div>
                  <span className="text-gray-400">{log.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}