"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ManagedUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchUsers(keyword = "") {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const url = keyword.trim()
        ? `http://localhost:3001/users?search=${encodeURIComponent(keyword.trim())}`
        : "http://localhost:3001/admin/users";

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to load users list");
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleRoleChange(id: number, newRole: string) {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/admin/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update role");
      }

      setSuccess(`User role updated to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  }

  async function handleDeleteUser(id: number) {
    if (!confirm("Are you sure you want to remove this user account?")) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete user");
      }

      setSuccess("User account deleted successfully");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Search by full name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-900"
          />
          <button
            onClick={() => fetchUsers(search)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
          >
            Search
          </button>
          {search && (
            <button
              onClick={() => {
                setSearch("");
                fetchUsers("");
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition"
            >
              Clear
            </button>
          )}
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-gray-500">Loading user list...</div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center bg-white border border-gray-200 rounded-lg py-16 text-gray-500">
            No registered users found matching your search.
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Full Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        #{u.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {u.fullName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{u.email}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{u.phone}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="border border-gray-300 rounded px-2.5 py-1 text-xs font-medium text-gray-800 bg-white"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="PARKING_MANAGER">PARKING_MANAGER</option>
                          <option value="PARKING_ATTENDANT">PARKING_ATTENDANT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-xs border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded transition"
                        >
                          Remove
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

      <Footer />
    </div>
  );
}