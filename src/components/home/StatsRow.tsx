"use client";

import { FileText, Crown, Calendar } from "lucide-react";

interface StatsRowProps {
  papersCount: number;
  freeRemaining: number;
  isPremium: boolean;
}

export function StatsRow({ papersCount, freeRemaining, isPremium }: StatsRowProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const chips = [
    {
      icon: <FileText className="w-3.5 h-3.5 text-[#1E88E5]" />,
      label: `${papersCount} Paper${papersCount !== 1 ? "s" : ""}`,
    },
    {
      icon: <Crown className="w-3.5 h-3.5 text-amber-500" />,
      label: isPremium ? "Premium" : `${freeRemaining} Free Left`,
    },
    {
      icon: <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />,
      label: today,
    },
  ];

  return (
    <div className="flex gap-2">
      {chips.map((chip, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 bg-white rounded-full px-3 py-2 border border-[#E5E7EB] shadow-sm"
        >
          {chip.icon}
          <span className="text-xs font-medium text-[#374151] whitespace-nowrap">
            {chip.label}
          </span>
        </div>
      ))}
    </div>
  );
}
