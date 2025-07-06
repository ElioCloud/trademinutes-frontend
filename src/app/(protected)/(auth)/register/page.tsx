"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );
      const data = await res.text();
      if (!res.ok) {
        throw new Error(data || "Registration failed");
      }
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-zinc-200 text-gray-900 font-[var(--font-geist-sans)] flex flex-col relative overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-32">
        <div className="flex flex-col md:flex-row justify-center items-center gap-12 w-full">
          {/* Left: Image */}
          <div className="hidden md:block">
            <img
              src="/register.png"
              alt="Register visual"
              className="h-[500px] object-contain"
            />
          </div>
          {/* Right: Register Form */}
          <section className="rounded-xl p-8 w-full max-w-sm bg-white/30 backdrop-blur border border-white/40 shadow-lg text-black">
            <h2 className="text-4xl font-bold text-center mb-6 font-mono">Register</h2>
            <form onSubmit={handleRegister}>
              {success && (
                <p className="text-green-500 text-sm mb-2 text-center">{success}</p>
              )}
              {error && (
                <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
              )}
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mb-3 rounded border bg-white border-gray-300 text-black"
                required
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-3 rounded border bg-white border-gray-300 text-black"
                required
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-4 rounded border bg-white border-gray-300 text-black"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded font-bold text-white"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
            <p className="text-sm text-center mt-4 text-black">
              Already have an account?{' '}
              <span
                onClick={() => router.push("/login")}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Sign in
              </span>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
