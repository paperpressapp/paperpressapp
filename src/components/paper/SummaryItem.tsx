"use client";

/**
 * SummaryItem Component
 * 
 * Single statistic item in the summary bar.
 */

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/shared";
import { cn } from "@/lib/utils";

interface SummaryItemProps {
  /** Icon element */
  icon: React.ReactNode;
  /** Background color for icon */
  iconBgColor: string;
  /** Count to display */
  count: number;
  /** Label text */
  label: string;
}

export function SummaryItem({ icon, iconBgColor, count, label }: SummaryItemProps) {
  return (
    <div className="flex flex-col items-center flex-1">
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
        style={{ backgroundColor: iconBgColor }}
      >
        {icon}
      </div>
      <span className="text-xl font-bold text-foreground">
        <AnimatedCounter value={count} duration={300} />
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
