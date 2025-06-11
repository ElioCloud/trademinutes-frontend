'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdDashboard } from 'react-icons/md';
import { FiLogOut } from 'react-icons/fi';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const events = [
  { title: 'Meeting', start: new Date() }
];

export default function BookAppointment() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className={`${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen flex`}>
      {/* Sidebar */}
      <aside className={`w-64 min-h-screen p-5 space-y-4 ${isDarkMode ? 'bg-zinc-800 text-white' : 'bg-white text-black border-r border-gray-200'}`}>
        <h2 className="text-2xl font-bold mb-8 cursor-pointer" onClick={() => router.push('/')}>
          TradeMinutes
        </h2>
        <nav className="space-y-2">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 w-full text-left py-2 px-4 rounded bg-violet-600 text-white">
            <MdDashboard className="text-lg" />
            Dashboard
          </button>
          <button className="flex items-center gap-2 w-full text-left py-2 px-4 rounded bg-violet-600 text-white">
            <MdDashboard className="text-lg" />
            Book Appointment
          </button>
          <button onClick={() => router.push('/profile')} className="flex items-center gap-2 w-full text-left py-2 px-4 rounded bg-violet-600 text-white">
            <MdDashboard className="text-lg" />
            My Profile
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

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Book Appointment</h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-sm rounded border px-3 py-1 border-gray-400 bg-zinc-700 text-white hover:bg-zinc-600"
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-white'} p-4 rounded-xl shadow-md`}>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView='dayGridMonth'
            events={events}
            eventContent={renderEventContent}
            height="auto"
          />
        </div>
      </main>
    </div>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <>
      <b>{eventInfo.timeText}</b> <i>{eventInfo.event.title}</i>
    </>
  );
}
