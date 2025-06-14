"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const addLog = (msg: string) =>
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLogs([]);
    setLoading(true);

    if (!token) {
      setError("Reset token missing.");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      addLog("🔄 Sending password reset...");
      const res = await fetch(
        "https://trademinutes-auth.onrender.com/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        }
      );

      const text = await res.text();

      if (!res.ok) {
        addLog(`❌ Server error: ${text}`);
        throw new Error(text || "Failed to reset password");
      }

      setMessage("✅ Password reset successful. Redirecting to login...");
      addLog("✅ Password reset complete");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      addLog(`❌ Reset failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 relative">
      {/* Debug Button */}
      <button
        type="button"
        onClick={() => setIsDebugOpen(!isDebugOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-black text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-gray-800 transition"
        title="Toggle Debug"
      >
        🐞
      </button>

      {/* Debug Sidebar */}
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

      {/* Content */}
      <div className="flex flex-col md:flex-row justify-center items-center min-h-[calc(100vh-80px)] px-4 gap-12">
        {/* Left: Image */}
        <div className="hidden md:block">
          <img
            src="/reset1.png"
            alt="Reset visual"
            className="h-[500px] object-contain"
          />
        </div>

        {/* Right: Form */}
        <div className="rounded-md p-8 w-full max-w-sm bg-gray-100 dark:bg-zinc-900 text-black dark:text-white transition-colors duration-300">
          <h2 className="text-4xl font-bold text-center mb-6 font-mono">
            Reset Password
          </h2>

          <form onSubmit={handleReset}>
            {message && (
              <p className="text-green-500 text-sm mb-2 text-center">
                {message}
              </p>
            )}
            {error && (
              <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
            )}

            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-3 rounded border bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-black dark:text-white"
              required
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 mb-4 rounded border bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-black dark:text-white"
              required
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold text-white"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-black dark:text-white">
            Back to{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
