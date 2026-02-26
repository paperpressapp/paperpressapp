"use client";

import { useEffect, useState } from "react";
import { getUsageStats, checkPremiumStatus } from "@/lib/premium";

export function UsageProgressBar() {
  const [stats, setStats] = useState({ used: 0, limit: 30, isPremium: false, resetDate: null as string | null });

  useEffect(() => {
    const status = checkPremiumStatus();
    if (status.isPremium) {
      setStats({ used: -1, limit: -1, isPremium: true, resetDate: null });
    } else {
      const usageStats = getUsageStats();
      setStats(usageStats);
    }
  }, []);

  if (stats.isPremium) return null;

  const percentage = (stats.used / stats.limit) * 100;
  const isLow = percentage > 80;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mt-4">
      <div className="flex justify-between text-sm text-white/80 mb-2">
        <span>Free Papers Used</span>
        <span>{stats.used}/{stats.limit}</span>
      </div>
      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            isLow ? 'bg-red-400' : 'bg-white/60'
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {isLow && (
        <p className="text-xs text-red-300 mt-2">
          Running low — upgrade for unlimited access
        </p>
      )}
      {stats.resetDate && !isLow && (
        <p className="text-xs text-white/50 mt-2">
          Resets on {stats.resetDate}
        </p>
      )}
    </div>
  );
}
