"use client";

/**
 * PapersTabs Component
 * Filter tabs for papers list.
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PapersTabsProps {
  activeTab: "all" | "month";
  onChange: (tab: "all" | "month") => void;
}

const tabs = [
  { value: "all" as const, label: "All Papers" },
  { value: "month" as const, label: "This Month" },
];

export function PapersTabs({ activeTab, onChange }: PapersTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-white/60 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === tab.value
              ? "bg-white text-[#1E88E5] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
