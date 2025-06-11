'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdDashboard } from 'react-icons/md';
import { FiLogOut } from 'react-icons/fi';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function ProfileDashboardPage() {
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
     const { data: session, status } = useSession();


  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

useEffect(() => {

  if (status === 'loading') return;

  const savedTheme = localStorage.getItem('theme');
  setIsDarkMode(savedTheme === 'dark');

  const getToken = (): string | null => {
    if (status === 'authenticated' && session?.accessToken) {
      localStorage.setItem('token', session.accessToken);
      return session.accessToken;
    }

    const stored = localStorage.getItem('token');
    console.log('🧪 Using localStorage token:', stored);
    return stored;
  };

  const fetchProfile = async () => {
    const token = getToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      console.log('🔁 Fetching profile with token:', token);
      const res = await fetch('https://trademinutes-auth.onrender.com/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Profile fetch failed');
    
      setProfile(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Now call it
  fetchProfile();
}, [status, session, router]);



  useEffect(() => {
    console.log("status",status, session)
    if (status === 'authenticated' && session?.accessToken) {
      localStorage.setItem('token', session.accessToken);
      console.log('Access token saved to localStorage:', session.accessToken);
    }
  }, [status, session]);

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

  if (loading) return null;

  return (
    <div className={`${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen flex`}>
      {/* Sidebar */}
      <aside className={`w-64 min-h-screen p-5 space-y-4 ${isDarkMode ? 'bg-zinc-800 text-white' : 'bg-white text-black border-r border-gray-200'}`}>
        <h2 className="text-2xl font-bold mb-8 cursor-pointer" onClick={() => router.push('/')}>
          TradeMinutes
        </h2>
        <nav className="space-y-2">
          <button className="flex items-center gap-2 w-full text-left py-2 px-4 rounded bg-violet-600 text-white">
            <MdDashboard className="text-lg" />
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left py-2 px-4 rounded 
                       text-black dark:text-white 
                       bg-white hover:bg-gray-200 
                       dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            <FiLogOut className="text-lg text-black dark:text-white" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-sm rounded border px-3 py-1 border-gray-400 bg-zinc-700 text-white hover:bg-zinc-600"
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Panel */}
            <div className={`p-6 rounded-xl shadow-md col-span-2 ${isDarkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
              <h2 className="text-lg font-semibold mb-4">Welcome, {profile.name}</h2>
              <p className="text-sm mb-2">Email: <span className="font-medium">{profile.email}</span></p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your dashboard metrics will appear below.</p>
            </div>

            {/* Reviews */}
            <div className={`p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
              <h2 className="text-lg font-semibold mb-4">Reviews</h2>
              <p className="text-3xl font-bold text-green-600 text-center mb-2">⭐4.85</p>
            </div>

            {/* Locations */}
            <div className={`p-6 rounded-xl shadow-md col-span-2 ${isDarkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
              <h2 className="text-lg font-semibold mb-4">Locations</h2>
              <div className={`h-32 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-zinc-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                Map Placeholder
              </div>
            </div>

            {/* Rewards */}
            <div className={`p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
              <h2 className="text-lg font-semibold mb-4">Rewards</h2>
              <div className={`h-24 rounded-lg flex items-center justify-between px-4 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-100'}`}>
                <div>
                  <p className="text-sm font-semibold">Congratulations</p>
                  <p className="text-lg font-bold text-green-600">$50</p>
                </div>
                <Image
                  src="/reward.jpg"
                  alt="Reward"
                  width={64}
                  height={64}
                  className="object-contain rounded"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
