'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import DashboardWrapper from '@/components/Layouts/layout';

// 1. Define the Profile type
interface Profile {
  name: string;
  email: string;
  college: string;
  program: string;
  year: string;
  bio: string;
  skills: string[];
}

export default function ProfileDashboardPage() {
  // 2. Use the type in useState
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 3. Simulate fetching profile with dummy data
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');

    const dummyProfile: Profile = {
      name: "Neelam Gauchan",
      email: "neelam@example.com",
      college: "Seneca College",
      program: "Cloud Architecture and Administration",
      year: "2nd Year",
      bio: "Passionate about peer learning and helping others succeed. I enjoy mentoring and sharing useful resources to make college life easier for everyone.",
      skills: [
        "Python",
        "Math Help",
        "Presentation Design",
        "Cleaning Tasks",
        "Resume Review"
      ]
    };

    setTimeout(() => {
      setProfile(dummyProfile);
      setLoading(false);
    }, 500); // simulate network delay
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

  if (loading) return null;

  return (
    <DashboardWrapper>
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className={`col-span-2 p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-4 mb-4">
              <Image src="/profile.jpg" alt="Profile" width={80} height={80} className="rounded-full object-cover" />
              <div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.program} - {profile.year}</p>
                <p className="text-sm">{profile.email}</p>
                <p className="text-sm">{profile.college}</p>
              </div>
            </div>
            <p className="text-sm italic text-gray-600 dark:text-gray-400">{profile.bio}</p>
          </div>

          {/* Profile Stats */}
          <div className={`p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Profile Stats</h2>
            <ul className="text-sm space-y-2">
              <li>⭐ Rating: 4.85 (from completed tasks)</li>
              <li>🕒 Time Helping: 10h 15m</li>
              <li>📆 Sessions Conducted: 12</li>
            </ul>
          </div>

          {/* Skills & Interests */}
          <div className={`col-span-2 p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Skills & Interests</h2>
            <div className="flex flex-wrap gap-2">
              {/* {profile?.skills?.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">#{tag}</span>
              ))} */}
            </div>
          </div>

          {/* Achievements */}
          <div className={`p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Achievements</h2>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Top Helper of the Week</li>
              <li>100 Credit Milestone</li>
              <li>Mentorship Star</li>
              <li>First Task Completed in Another City</li>
            </ul>
          </div>

          {/* Activity Map Placeholder */}
          <div className={`col-span-2 p-6 rounded-xl shadow-md ${isDarkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Activity Map</h2>
            <div className={`h-32 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-zinc-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
              Map Placeholder
            </div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}
