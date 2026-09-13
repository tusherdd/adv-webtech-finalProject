"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ParkingItem = {
  id: number;
  parkingName: string;
  location: string;
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number | string;
  owner?: {
    id: number;
    fullName?: string;
    email?: string;
  };
};

export default function ManagerParkingPage() {
  const router = useRouter();
  const [parkings, setParkings] = useState<ParkingItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [parkingName, setParkingName] = useState("");
  const [location, setLocation] = useState("");
  const [totalSlots, setTotalSlots] = useState<number | string>("");
  const [pricePerHour, setPricePerHour] = useState<number | string>("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // 1. Get current user ID from profile
      const profRes = await fetch("http://localhost:3001/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profRes.ok) throw new Error("Please log in again");
      const profile = await profRes.json();
      setCurrentUserId(profile.sub);

      // 2. Fetch all parkings
      const parkRes = await fetch("http://localhost:3001/parking");
      if (!parkRes.ok) throw new Error("Failed to load parking list");
      const allParkings = await parkRes.json();

      // 3. Filter for lots owned by this manager, or show all if manager
      const myLots = Array.isArray(allParkings)
        ? allParkings.filter(
            (p: ParkingItem) => !p.owner || p.owner.id === profile.sub
          )
        : [];

      setParkings(myLots);
    } catch (err: any) {
      setError(err.message || "Failed to load parking records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAddModal() {
    setModalMode("add");
    setSelectedId(null);
    setParkingName("");
    setLocation("");
    setTotalSlots("");
    setPricePerHour("");
    setFormError("");
  }

  function openEditModal(parking: ParkingItem) {
    setModalMode("edit");
    setSelectedId(parking.id);
    setParkingName(parking.parkingName);
    setLocation(parking.location);
    setTotalSlots(parking.totalSlots);
    setPricePerHour(parking.pricePerHour);
    setFormError("");
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSubmitting(true);

    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      // Strictly matches backend CreateParkingDto: parkingName, location, totalSlots, pricePerHour
      const payload = {
        parkingName: parkingName.trim(),
        location: location.trim(),
        totalSlots: Number(totalSlots),
        pricePerHour: Number(pricePerHour),
      };

      let res;
      if (modalMode === "add") {
        res = await fetch("http://localhost:3001/parking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`http://localhost:3001/parking/${selectedId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Operation failed"
        );
      }

      setSuccess(
        modalMode === "add"
          ? "New parking lot added successfully!"
          : "Parking lot updated successfully!"
      );
      setModalMode(null);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this parking location?")) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/parking/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete parking location");
      }

      setSuccess("Parking location deleted successfully.");
      setParkings((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Error deleting parking spot.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Parking Lots</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create, update, and monitor your parking spaces and pricing.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm transition self-start sm:self-auto shadow-sm"
          >
            + Add New Parking Lot
          </button>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-gray-500">Loading your parking lots...</div>
        )}

        {!loading && parkings.length === 0 && (
          <div className="text-center bg-white border border-gray-200 rounded-lg py-16 px-4">
                        <h3 className="text-lg font-semibold text-gray-900">No Parking Lots Added</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              You have not registered any parking locations yet.
            </p>
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium transition"
            >
              Add Your First Parking Lot
            </button>
          </div>
        )}

        {!loading && parkings.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Parking Name</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Total Slots</th>
                    <th className="px-6 py-3">Available</th>
                    <th className="px-6 py-3">Rate / Hr</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parkings.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {p.parkingName}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {p.location}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-800">
                        {p.totalSlots}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                            Number(p.availableSlots) > 0
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {p.availableSlots} available
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-blue-600 text-xs">
                        ৳{Number(p.pricePerHour)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-xs border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Add New Parking Lot" : "Edit Parking Details"}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Parking Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIUB Smart Parking"
                  value={parkingName}
                  onChange={(e) => setParkingName(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Location / Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kuratoli, Kuril, Dhaka"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Total Slots *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price Per Hour (৳) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 50"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition disabled:bg-blue-300"
                >
                  {formSubmitting
                    ? "Saving..."
                    : modalMode === "add"
                    ? "Create Parking"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}