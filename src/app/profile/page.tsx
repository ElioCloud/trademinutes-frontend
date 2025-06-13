'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MdDashboard } from 'react-icons/md';
import { FiLogOut, FiSun, FiMoon, FiPower, FiEdit } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';

/**
 * User-facing profile dashboard (summary page)
 * – Fetches profile from backend
 * – Supports dark / light theme
 * – Shows sidebar, profile card, wallet, tasks
 */
export default function UserProfileSummaryPage() {
  // ──────────────────────────────────────────────────────────────────────────
  // State hooks
  // ──────────────────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    lastLogin: string;
    device: string;
  } | null>(null);

  const [loading, setLoading]   = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const router = useRouter();

  // ──────────────────────────────────────────────────────────────────────────
  // On mount: theme + JWT + fetch profile
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Restore theme preference
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');

    // Validate token
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Async fetch user profile
    const fetchProfile = async () => {
      try {
        const res = await fetch('https://trademinutes-auth.onrender.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Basic content-type guard
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Invalid response format');
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');

        // Save profile to state
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Apply / remove dark class on <html>
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // ──────────────────────────────────────────────────────────────────────────
  // Handle logout click
  // ──────────────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Show nothing until profile loaded
  if (loading || !profile) return null;

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className={`${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen flex`}>

      {/* ───── Sidebar / Navigation ───── */}
      <aside className={`w-64 min-h-screen p-5 space-y-4 ${isDarkMode ? 'bg-zinc-800 text-white' : 'bg-white text-black border-r border-gray-200'}`}>
        <h2 className="text-2xl font-bold mb-8 cursor-pointer" onClick={() => router.push('/')}>
          TradeMinutes
        </h2>

        <nav className="space-y-2">
          {/* Dashboard link */}
          <button onClick={() => router.push('dashboard')}
                  className="flex items-center gap-2 w-full text-left py-2 px-4 rounded bg-violet-600 text-white">
            <MdDashboard className="text-lg" /> Dashboard
          </button>

          {/* My Profile link */}
          <button onClick={() => router.push('profile')}
                  className="flex items-center gap-2 w-full text-left py-2 px-4 rounded bg-white hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
            <FiEdit className="text-lg" /> My Profile
          </button>

          {/* Logout */}
          <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left py-2 px-4 rounded bg-white hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
            <FiPower className="text-lg" /> Logout
          </button>
        </nav>
      </aside>

      {/* ───── Main Content ───── */}
      <main className="flex-1 p-6">
        {/* Header row */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">My Profile</h1>
          {/* Theme toggle */}
          <button onClick={() => setIsDarkMode(!isDarkMode)}
                  className="text-sm rounded border px-3 py-1 border-gray-400 bg-zinc-700 text-white hover:bg-zinc-600">
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Entire profile grid */}
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col lg:flex-row gap-6 justify-center items-start">

          {/* ─── Profile Card ─── */}
          <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-sm">
            <Image src="/avatar.jpg" alt="User" width={800} height={600}
                   className="w-full h-64 object-cover rounded-xl mb-4"/>

            <h2 className="text-lg font-semibold mb-1">{profile.name}</h2>

            {/* Hard-coded last login info (example) */}
            <p className="text-xs text-gray-400 mb-2">
              Last login: 12 Jun 2025, 22:10<br/>
              Chrome on MacOS, Toronto (CA)
            </p>

            {/* Academic details */}
            <p className="text-sm">🎓 University of Toronto</p>
            <p className="text-sm text-gray-500 mb-2">User Email: {profile.email}</p>
            <p className="text-sm text-gray-500 mb-2">College Email: alex.j@utoronto.ca</p>

            {/* Small status pill */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-green-600">Credits auto-sync active</span>
              <span className="h-3 w-3 bg-green-500 rounded-full" />
            </div>

            <button className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white py-2 rounded-full text-sm font-semibold">
              Save Profile
            </button>
          </div>

          {/* ─── Right-hand Column (Wallet + Tasks) ─── */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Wallet Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-base">My Eliocloud Wallet</h3>
                <button className="text-xs px-3 py-1 border rounded-md">Edit</button>
              </div>

              {/* Account rows */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">Active account</p>
                    <p className="font-semibold">alexj.elio.credits</p>
                  </div>
                  <button className="text-xs bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-1 rounded-full font-medium">
                    Withdraw Funds
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">Lifetime earnings</p>
                    <p className="font-semibold">$730.00 (730 🪙)</p>
                  </div>
                  <button className="text-xs bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-1 rounded-full font-medium">
                    View History
                  </button>
                </div>
              </div>
            </div>

            {/* Tasks Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-base">My Tasks</h3>
                <button className="text-xs px-3 py-1 border rounded-md">Filter by</button>
              </div>

              {/* Task list */}
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Completed project milestone',       status: 'paid',   credits: 100 },
                  { label: 'Bug report accepted',                status: 'paid',   credits: 25  },
                  { label: 'Referral: Sarah Wong',               status: 'paid',   credits: 50  },
                  { label: 'Task: Fix accessibility issues',     status: 'unpaid', credits: 30  },
                  { label: 'Daily login streak (Day 7)',         status: 'paid',   credits: 10  },
                  { label: 'Submitted documentation improvement',status: 'paid',   credits: 20  },
                  { label: 'Joined weekly webinar',              status: 'paid',   credits: 15  },
                  { label: 'Answered 3 community questions',     status: 'paid',   credits: 18  },
                  { label: 'Invited a team member',              status: 'unpaid', credits: 40  },
                  { label: 'Uploaded first open-source project', status: 'paid',   credits: 60  },
                ].map((task, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${task.status === 'paid' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{task.label}</span>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${task.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-pink-100 text-pink-700'}`}>
                      {task.status === 'paid' ? `+${task.credits} 🪙` : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
