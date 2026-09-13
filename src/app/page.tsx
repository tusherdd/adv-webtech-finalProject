import Link from "next/link";

export default function Home() {
  return (
    <main
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/parking-bg.png')",
      }}
    >
      <div className="min-h-screen bg-white/70 flex flex-col items-center justify-center">

        {/* Logo */}
        <h1 className="text-5xl font-bold text-blue-600">
          ParkSmart
        </h1>

        {/* Description */}
        <p className="mt-3 text-2xl font-semibold text-gray-800">
          Smart Parking System
        </p>

        <p className="mt-2 text-gray-600">
          Find and reserve your parking easily.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">

          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded"
          >
            Register
          </Link>

        </div>

        {/* Footer */}
        <p className="absolute bottom-5 text-sm text-gray-500">
          © 2026 ParkSmart
        </p>

      </div>
    </main>
  );
}