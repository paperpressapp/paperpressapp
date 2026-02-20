"use client";

/**
 * PapersProgress Component
 * 
 * Shows paper usage progress for free tier.
 */

import { ProgressBar } from "@/components/shared";

interface PapersProgressProps {
  /** Papers used this month */
  used: number;
  /** Total allowed papers */
  total: number;
}

export function PapersProgress({ used, total }: PapersProgressProps) {
  const percentage = (used / total) * 100;
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-foreground">{used} of {total} used</span>
        <span className="text-muted-foreground">{Math.round(percentage)}%</span>
      </div>
      <ProgressBar value={percentage} height={6} showLabel={false} />
    </div>
  );
}
