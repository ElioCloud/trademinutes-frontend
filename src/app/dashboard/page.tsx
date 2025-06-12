'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Image from 'next/image';
import DashboardWrapper from '@/components/Layouts/layout';

export default function ProfileDashboardPage() {
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

 

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');

    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('https://trademinutes-auth.onrender.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
        setProfile(data);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

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
  
      <DashboardWrapper>
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
        </DashboardWrapper>

  
  );
}
