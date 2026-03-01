"use client";

/**
 * PapersTabs Component
 * Filter tabs for papers list.
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/hooks";

interface PapersTabsProps {
  activeTab: "all" | "month" | "week" | "favorites";
  onChange: (tab: "all" | "month" | "week" | "favorites") => void;
}

const tabs = [
  { value: "all" as const, label: "All" },
  { value: "month" as const, label: "Month" },
  { value: "week" as const, label: "Week" },
  { value: "favorites" as const, label: "Fav" },
];

export function PapersTabs({ activeTab, onChange }: PapersTabsProps) {
  const handleTabChange = (tab: "all" | "month" | "week" | "favorites") => {
    triggerHaptic('light');
    onChange(tab);
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-[#1A1A1A] rounded-[14px] border border-[#2A2A2A]">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleTabChange(tab.value)}
          className={cn(
            "relative px-3 py-1.5 text-xs font-medium rounded-[10px] transition-all",
            activeTab === tab.value
              ? "text-[#0A0A0A]"
              : "text-[#A0A0A0] hover:text-white"
          )}
        >
          {activeTab === tab.value && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-[#B9FF66] rounded-[10px]"
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
