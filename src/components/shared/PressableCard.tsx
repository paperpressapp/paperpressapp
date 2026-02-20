"use client";

/**
 * PressableCard Component
 * 
 * Card with press animation effects.
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PressableCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Press handler */
  onPress: () => void;
  /** Whether disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

export function PressableCard({
  children,
  onPress,
  disabled = false,
  className = "",
}: PressableCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className={cn(
        "w-full text-left bg-card border rounded-xl overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.button>
  );
}
