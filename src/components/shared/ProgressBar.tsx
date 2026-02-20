"use client";

/**
 * ProgressBar Component
 * 
 * Animated horizontal progress bar with optional percentage label.
 */

import { motion } from "framer-motion";

interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Bar color (hex or Tailwind class) */
  color?: string;
  /** Bar height in pixels */
  height?: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Optional additional class names */
  className?: string;
}

export function ProgressBar({
  value,
  color = "#1E88E5",
  height = 8,
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2">
        {/* Progress track */}
        <div
          className="flex-1 rounded-full bg-muted overflow-hidden"
          style={{ height: `${height}px` }}
        >
          {/* Progress fill */}
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${clampedValue}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Percentage label */}
        {showLabel && (
          <span className="text-sm font-medium text-foreground min-w-[3rem] text-right">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    </div>
  );
}
