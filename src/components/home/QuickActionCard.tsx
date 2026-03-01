"use client";

/**
 * QuickActionCard Component - Redesigned
 * 
 * Single quick action card for the home page.
 * Improved styling with glassmorphism effect.
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  /** Card icon */
  icon: React.ReactNode;
  /** Card label */
  label: string;
  /** Whether this is the primary (highlighted) card */
  isPrimary?: boolean;
  /** Press handler */
  onPress: () => void;
}

export function QuickActionCard({
  icon,
  label,
  isPrimary = false,
  onPress,
}: QuickActionCardProps) {
  return (
    <motion.button
      onClick={onPress}
      className={cn(
        "flex-shrink-0 w-[100px] h-[110px] rounded-lg flex flex-col items-center justify-center gap-3",
        "transition-all duration-200",
        isPrimary 
          ? "bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white shadow-lg shadow-[#1E88E5]/30 border border-white/20" 
          : "bg-white/90 backdrop-blur-sm border border-gray-100 text-foreground shadow-sm hover:shadow-md hover:border-gray-200"
      )}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        isPrimary 
          ? "bg-white/25 backdrop-blur-sm" 
          : "bg-[#1E88E5]/10"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-xs font-semibold",
        isPrimary ? "text-white" : "text-gray-700"
      )}>
        {label}
      </span>
    </motion.button>
  );
}
