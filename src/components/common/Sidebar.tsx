"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MdDashboard } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import Link from "next/link";

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
        <h2
          className="text-2xl font-bold mb-8 cursor-pointer"
          onClick={() => router.push("/")}
        >
          TradeMinutes
        </h2>
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
