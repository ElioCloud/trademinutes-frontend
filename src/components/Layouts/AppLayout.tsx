'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MdDashboard } from 'react-icons/md';
import { FiLogOut } from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: LayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className={`${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen flex`}>
      {/* Sidebar */}
      <aside className={`w-64 min-h-screen p-5 space-y-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-white border-r border-gray-200'}`}>
        <h2 className="text-2xl font-bold mb-8 cursor-pointer" onClick={() => router.push('/')}>
          TradeMinutes
        </h2>
        <nav className="space-y-2">
          <SidebarButton href="/dashboard" label="Dashboard" pathname={pathname} router={router} />
          <SidebarButton href="/book-appointment" label="Book Appointment" pathname={pathname} router={router} />
          <SidebarButton href="/profile" label="My Profile" pathname={pathname} router={router} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left py-2 px-4 rounded bg-white hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold capitalize">
            {pathname?.split('/').pop()?.replace('-', ' ')}
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-sm rounded border px-3 py-1 border-gray-400 bg-zinc-700 text-white hover:bg-zinc-600"
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}

function SidebarButton({
  href,
  label,
  pathname,
  router,
}: {
  href: string;
  label: string;
  pathname: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
}) {
  const isActive = pathname === href;
  return (
    <button
      onClick={() => router.push(href)}
      className={`flex items-center gap-2 w-full text-left py-2 px-4 rounded ${
        isActive ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-zinc-700 text-black dark:text-white'
      }`}
    >
      <MdDashboard className="text-lg" />
      {label}
    </button>
  );
}
