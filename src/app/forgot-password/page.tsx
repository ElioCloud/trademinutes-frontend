'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const addLog = (msg: string) =>
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setIsDarkMode(saved === 'dark');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLogs([]);
    setLoading(true);

    try {
      addLog('📡 Sending forgot password request...');
      const res = await fetch('https://trademinutes-auth.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const text = await res.text();

      if (!res.ok) {
        addLog(`❌ Server error: ${text}`);
        throw new Error(text || 'Failed to send reset link');
      }

      setMessage('✅ Password reset link sent to your email.');
      addLog('✅ Reset link sent successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
      addLog(`❌ Forgot password failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-black' : 'bg-white'} min-h-screen transition-colors duration-300 relative`}>
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
      <div className={`fixed top-0 right-0 h-full w-72 bg-black text-white p-4 text-xs shadow-xl overflow-y-auto transform transition-transform z-30 ${
        isDebugOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <h2 className="font-bold text-sm mb-2">🧪 Debug Log</h2>
        {logs.length === 0 ? (
          <p className="text-gray-400">No logs yet</p>
        ) : (
          <ul className="space-y-1">
            {logs.map((log, i) => (
              <li key={i} className="text-green-300">{log}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Navbar */}
      <nav className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} shadow-md py-4 px-6 flex justify-between items-center`}>
        <h1
          className="text-2xl font-bold font-mono cursor-pointer hover:underline"
          onClick={() => router.push('/')}
        >
          TradeMinutes
        </h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="text-sm rounded border px-3 py-1 border-gray-400 bg-zinc-700 text-white hover:bg-zinc-600"
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </nav>

      {/* Content */}
      <div className="flex flex-col md:flex-row justify-center items-center min-h-[calc(100vh-80px)] px-4 gap-12">
        {/* Left: Image */}
        <div className="hidden md:block">
          <img src="/forgot.png" alt="Forgot visual" className="h-[500px] object-contain" />
        </div>

        {/* Right: Form */}
        <div className={`rounded-md p-8 w-full max-w-sm ${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-gray-100 text-black'} transition-colors duration-300`}>
          <h2 className="text-4xl font-bold text-center mb-6 font-mono">Forgot Password</h2>

          <form onSubmit={handleForgotPassword}>
            {message && <p className="text-green-500 text-sm mb-2 text-center">{message}</p>}
            {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 mb-4 rounded border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-black'}`}
              required
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold text-white"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className={`text-sm text-center mt-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Remembered your password?{' '}
            <span
              onClick={() => router.push('/login')}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
