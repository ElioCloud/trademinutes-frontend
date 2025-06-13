"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="px-3 py-1 rounded border border-gray-400 dark:border-gray-600 bg-zinc-700 text-white hover:bg-zinc-600"
    >
      {currentTheme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
