" use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="w-14 h-8 rounded-full bg-[var(--border-color)] p-1 transition-colors relative"
      aria-label="Toggle theme"
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
          isDark ? "translate-x-0 bg-[#1A1A1A]" : "translate-x-6 bg-white"
        }`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-[#B9FF66]" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </div>
    </button>
  );
}
