"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type UserProfile = {
  sub: number;
  email: string;
  role: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:3001/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
        }
      })
      .catch(() => {});
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    router.push("/login");
  }

  const role = user?.role || "CUSTOMER";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-blue-600 tracking-tight flex items-center gap-2"
            >
              ParkSmart
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded text-sm font-medium ${
                  pathname === "/dashboard"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                Dashboard
              </Link>

              {/* Customer Links */}
              {role === "CUSTOMER" && (
                <>
                  <Link
                    href="/parking"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname.startsWith("/parking")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    Find Parking
                  </Link>

                  <Link
                    href="/reservations"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname === "/reservations"
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    My Reservations
                  </Link>

                  <Link
                    href="/payments"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname === "/payments"
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    My Payments
                  </Link>
                </>
              )}

              {/* Parking Manager Links */}
              {role === "PARKING_MANAGER" && (
                <>
                  <Link
                    href="/manager/parking"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname.startsWith("/manager/parking")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    Manage Lots
                  </Link>

                  <Link
                    href="/parking"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname === "/parking"
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    All Lots
                  </Link>
                </>
              )}

              {/* Parking Attendant Links */}
              {role === "PARKING_ATTENDANT" && (
                <>
                  <Link
                    href="/attendant"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname === "/attendant"
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    Attendant Desk
                  </Link>
                  <Link
                    href="/parking"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname === "/parking"
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    View Parking Lots
                  </Link>
                </>
              )}

              {/* Admin Links */}
              {role === "ADMIN" && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname === "/admin/dashboard"
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    Admin Overview
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname === "/admin/users"
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    href="/parking"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname === "/parking"
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    Parking Lots
                  </Link>
                  <Link
                    href="/admin/payments"
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      pathname === "/admin/payments"
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    Payments
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right section: Profile & Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition"
                >
                  {user.email.split("@")[0]}
                </Link>
                <span className="hidden sm:inline-block text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded">
                  {user.role}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3.5 py-1.5 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
