"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ThemeToggle from "@/components/common/ThemeToggle";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} — ${message}`,
    ]);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLogs([]);
    setLoading(true);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      addLog("❌ Invalid email format");
      setLoading(false);
      return;
    }

    try {
      addLog("🔌 Connecting to registration endpoint...");
      const res = await fetch(
        "https://trademinutes-auth.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await res.text();
      addLog("📤 Sent registration data");

      if (!res.ok) {
        addLog(`❌ Server responded with: ${data}`);
        throw new Error(data || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting to login...");
      addLog("✅ Registration successful");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      addLog(`❌ Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300 relative">
      {/* 🐞 Debug Toggle Button */}
      <button
        type="button"
        onClick={() => setIsDebugOpen(!isDebugOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-black text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-gray-800 transition"
        title="Toggle Debug"
      >
        🐞
      </button>

      {/* 🐞 Debug Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-black text-white p-4 text-xs shadow-xl overflow-y-auto transform transition-transform z-30 ${
          isDebugOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="font-bold text-sm mb-2">🧪 Debug Log</h2>
        {logs.length === 0 ? (
          <p className="text-gray-400">No logs yet</p>
        ) : (
          <ul className="space-y-1">
            {logs.map((log, i) => (
              <li key={i} className="text-green-300">
                {log}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Navbar */}
      <nav className="bg-white dark:bg-zinc-900 text-black dark:text-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1
          className="text-2xl font-bold font-mono cursor-pointer hover:underline"
          onClick={() => router.push("/")}
        >
          TradeMinutes
        </h1>
        <ThemeToggle />
      </nav>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row justify-center items-center min-h-[calc(100vh-80px)] px-2 gap-12">
        {/* Left: Image */}
        <div className="hidden md:block">
          <img
            src="/register.png"
            alt="Clock visual"
            className="h-[400px] object-contain"
          />
        </div>

        {/* Right: Form */}
        <div className="rounded-md p-8 w-full max-w-sm bg-gray-100 dark:bg-zinc-900 text-black dark:text-white transition-colors duration-300">
          <h2 className="text-4xl font-bold text-center mb-6 font-mono">
            Register
          </h2>

          <form onSubmit={handleRegister}>
            {success && (
              <p className="text-green-500 text-sm mb-2 text-center">
                {success}
              </p>
            )}
            {error && (
              <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
            )}

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 mb-3 rounded border bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-black dark:text-white"
              required
              disabled={loading}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-3 rounded border bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-black dark:text-white"
              required
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 rounded border bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-black dark:text-white"
              required
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold text-white"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
