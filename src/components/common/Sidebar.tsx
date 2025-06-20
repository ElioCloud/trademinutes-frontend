"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MdDashboard } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { BellIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'booking' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsRead', id })
      });
      
      if (!res.ok) throw new Error('Failed to update notification');
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllAsRead' })
      });
      
      if (!res.ok) throw new Error('Failed to update notifications');
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-violet-600 hover:text-violet-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-violet-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          notification.type === 'booking' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <p className="font-medium text-sm">{notification.title}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t">
            <Link
              href="/notifications"
              className="block text-center text-sm text-violet-600 hover:text-violet-800"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setIsDarkMode(saved === "dark");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      } min-h-screen flex`}
    >
      {/* Sidebar */}
      <aside
        className={`w-64 min-h-screen p-5 space-y-4 ${
          isDarkMode ? "bg-zinc-800" : "bg-white border-r border-gray-200"
        }`}
      >
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">TradeMinutes</h1>
          <NotificationBell />
        </div>
        <nav className="space-y-2">
          <SidebarButton
            href="/dashboard"
            label="Dashboard"
            pathname={pathname}
          />
          <SidebarButton
            href="/book-appointment"
            label="Book Appointment"
            pathname={pathname}
          />
          <SidebarButton
            href="/profile"
            label="My Profile"
            pathname={pathname}
          />
          <SidebarButton href="/tasks/list" label="Tasks" pathname={pathname} />
          <SidebarButton
            href="/tasks/explore"
            label="Explore Nearby Tasks"
            pathname={pathname}
          />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left py-2 px-4 rounded bg-white hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>
        </nav>
      </aside>
    </div>
  );
}

function SidebarButton({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 w-full text-left py-2 px-4 rounded ${
        isActive
          ? "bg-violet-600 text-white"
          : "bg-gray-100 dark:bg-zinc-700 text-black dark:text-white"
      }`}
    >
      <MdDashboard className="text-lg" />
      {label}
    </Link>
  );
}
