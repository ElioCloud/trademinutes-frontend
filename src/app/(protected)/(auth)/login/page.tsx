"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} — ${message}`,
    ]);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLogs([]);
    setLoading(true);

    try {
      addLog("🔌 Connecting to login endpoint...");
      const res = await fetch(
        "https://trademinutes-auth.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      addLog("📤 Sent login data");

      const contentType = res.headers.get("content-type") || "";

      // If not JSON, handle error as plain text
      if (!res.ok) {
        const errorText = contentType.includes("application/json")
          ? (await res.json()).message || "Login failed"
          : await res.text();
        addLog(`❌ Server error: ${errorText}`);
        throw new Error(errorText);
      }

      if (!contentType.includes("application/json")) {
        const raw = await res.text();
        addLog(`❌ Unexpected response format: ${raw}`);
        throw new Error("Unexpected response format from server");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      setSuccess("Login successful! Redirecting...");
      addLog("✅ Login successful, redirecting to /profile");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      addLog(`❌ Login failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-black" : "bg-white"
      } min-h-screen transition-colors duration-300 relative`}
    >
      {/* 🐞 Debug Button */}
      <button
        type="button"
        onClick={() => setIsDebugOpen(!isDebugOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-black text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-gray-800 transition"
        title="Toggle Debug"
      >
        🐞
      </button>

      {/* 🧪 Debug Sidebar */}
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
      
      <Navbar />
     
      
      {/* Content */}
      <div className="flex flex-col md:flex-row justify-center items-center min-h-[calc(100vh-80px)] px-4 gap-12">
        {/* Left: Image */}
        <div className="hidden md:block">
          <img
            src="/login1.png"
            alt="Login visual"
            className="h-[500px] object-contain"
          />
        </div>

        {/* Right: Login Form */}
        <div
          className={`rounded-md p-8 w-full max-w-sm ${
            isDarkMode ? "bg-zinc-900 text-white" : "bg-gray-100 text-black"
          } transition-colors duration-300`}
        >
          <h2 className="text-4xl font-bold text-center mb-6 font-mono">
            Login
          </h2>

          <form onSubmit={handleLogin}>
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
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 mb-3 rounded border ${
                isDarkMode
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
              required
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 mb-4 rounded border ${
                isDarkMode
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
              required
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold text-white"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-zinc-700" />
            <span className="px-2 text-zinc-400 text-sm">OR</span>
            <div className="flex-grow h-px bg-zinc-700" />
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => signIn("github", { callbackUrl: "/github-auth" })}
              className="w-10 h-10 bg-white border rounded-full flex items-center justify-center shadow hover:shadow-md"
              title="Log in with GitHub"
            >
              <img src="/github.png" alt="GitHub" className="w-5 h-5" />
            </button>
            <button
              onClick={() => signIn("google", { callbackUrl: "/google-auth" })}
              className="w-10 h-10 bg-white border rounded-full flex items-center justify-center shadow hover:shadow-md"
              title="Log in with Google"
            >
              <img src="/google.png" alt="Google" className="w-5 h-5" />
            </button>
          </div>

          <p
            onClick={() => router.push("/forgot-password")}
            className="text-sm text-blue-400 text-center mt-3 hover:underline cursor-pointer"
          >
            Forgot password?
          </p>

          <p
            className={`text-sm text-center mt-4 ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/register")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
