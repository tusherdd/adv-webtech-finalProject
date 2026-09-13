"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function validateForm() {
    // Full name validation
    if (fullName.trim().length < 3) {
      return "Full name must be at least 3 characters.";
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }

    // Phone validation
    const phonePattern = /^01[3-9]\d{8}$/;

    if (!phonePattern.test(phone)) {
      return "Please enter a valid Bangladeshi phone number.";
    }

    // Password validation
    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
          }),
        }
      );

      // Try to read JSON response
      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;

        // Handle duplicate email/phone
        if (
          typeof message === "string" &&
          message.toLowerCase().includes("phone")
        ) {
          throw new Error(
            "This phone number is already registered."
          );
        }

        if (
          typeof message === "string" &&
          message.toLowerCase().includes("email")
        ) {
          throw new Error(
            "This email address is already registered."
          );
        }

        throw new Error(message || "Registration failed.");
      }

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-blue-600">
          ParkSmart
        </h1>

        <p className="text-center text-gray-600 mt-2">
          Create your account
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 bg-green-100 border border-green-300 text-green-700 p-3 rounded">
            {success}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="mt-6">

          {/* Full Name */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-black">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded text-black placeholder:text-gray-500"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-black">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded text-black placeholder:text-gray-500"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-black">
              Phone
            </label>

            <input
              type="text"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              className="w-full border border-gray-300 p-2 rounded text-black placeholder:text-gray-500"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-black">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded text-black placeholder:text-gray-500"
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label className="block mb-2 font-medium text-black">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded text-black placeholder:text-gray-500"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-5">
          Already have an account?{" "}

          <Link
            href="/login"
            className="text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}