"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParkingCard, { Parking } from "@/components/ParkingCard";

export default function ParkingListPage() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchParkings(searchTerm = "") {
    setLoading(true);
    setError("");

    try {
      const url = searchTerm.trim()
        ? `http://localhost:3001/parking?search=${encodeURIComponent(searchTerm.trim())}`
        : "http://localhost:3001/parking";

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to load parking locations");
      }
      const data = await res.json();
      setParkings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch parking locations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchParkings();
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchParkings(search);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Parking</h1>
          <p className="mt-1 text-sm text-gray-600">
            Search and reserve available smart parking slots in real time.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by parking name or area / location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-blue-500"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium transition"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  fetchParkings("");
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm transition"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-base">Loading parking lots...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && parkings.length === 0 && (
          <div className="text-center bg-white border border-gray-200 rounded-lg py-16 px-4">
                        <h3 className="text-lg font-semibold text-gray-900">
              No Parking Locations Found
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {search
                ? `No results matching "${search}". Try searching for a different location.`
                : "There are currently no parking lots listed in the system."}
            </p>
          </div>
        )}

        {/* Parking Grid */}
        {!loading && parkings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkings.map((parking) => (
              <ParkingCard key={parking.id} parking={parking} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
