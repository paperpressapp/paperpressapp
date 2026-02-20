"use client";

/**
 * StatCard Component
 * 
 * Card displaying a statistic with icon, value, and label.
 */

import { motion } from "framer-motion";

interface StatCardProps {
  /** Icon element */
  icon: React.ReactNode;
  /** Statistic label */
  label: string;
  /** Statistic value */
  value: number | string;
  /** Icon background color */
  color: string;
  /** Optional additional class names */
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  color,
  className = "",
}: StatCardProps) {
  return (
    <motion.div
      className={`flex flex-col items-center p-4 rounded-xl bg-card border shadow-sm ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        {icon}
      </div>

      {/* Value */}
      <span className="text-2xl font-bold text-foreground mb-1">
        {value}
      </span>

      {/* Label */}
      <span className="text-xs text-muted-foreground text-center">
        {label}
      </span>
    </motion.div>
  );
}
