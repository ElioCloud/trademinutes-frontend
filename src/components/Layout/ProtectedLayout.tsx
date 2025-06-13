"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import ThemeToggle from "../common/ThemeToggle";
import Sidebar from "../common/Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Avoid hydration mismatch

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = currentTheme === "dark";

  return (
    <div
      className={`${
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      } min-h-screen flex`}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold capitalize">
            {pathname?.split("/").pop()?.replace("-", " ")}
          </h1>
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
