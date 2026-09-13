"use client";

import { useState } from "react";

type PaymentModalProps = {
  isOpen: boolean;
  reservationId: number | null;
  amount: number;
  parkingName?: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function PaymentModal({
  isOpen,
  reservationId,
  amount,
  parkingName,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen || !reservationId) return null;

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please login again to proceed with payment.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reservationId: reservationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Payment failed"
        );
      }

      setSuccess("Payment confirmed successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "An error occurred while processing payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Make Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {parkingName && (
          <p className="text-sm text-gray-600 mb-2">
            Parking: <span className="font-semibold text-gray-900">{parkingName}</span>
          </p>
        )}

        <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4 flex justify-between items-center">
          <span className="text-sm text-blue-900 font-medium">Total Amount Due</span>
          <span className="text-xl font-bold text-blue-700">৳{amount}</span>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-2.5 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-2.5 rounded text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            
            {/* Only Cash / Counter Method */}
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-lg flex items-start gap-3">
                            <div>
                <span className="font-bold text-sm text-emerald-900 block">
                  Cash at Counter
                </span>
                <span className="text-xs text-emerald-700 block mt-0.5 leading-relaxed">
                  Pay directly in cash to the parking attendant at the counter during entry/exit. Click below to confirm and generate your receipt.
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition disabled:bg-blue-300"
            >
              {loading ? "Processing..." : `Confirm Cash (৳${amount})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}