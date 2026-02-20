"use client";

/**
 * ActionButton Component
 * 
 * Single action button for the preview page.
 */

import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/shared";

interface ActionButtonProps {
  /** Icon element */
  icon: React.ReactNode;
  /** Button label */
  label: string;
  /** Icon/label color */
  color: string;
  /** Press handler */
  onPress: () => void;
  /** Loading state */
  isLoading?: boolean;
}

export function ActionButton({
  icon,
  label,
  color,
  onPress,
  isLoading = false,
}: ActionButtonProps) {
  return (
    <motion.button
      onClick={onPress}
      disabled={isLoading}
      className="flex-shrink-0 w-[80px] h-[90px] bg-card rounded-xl border shadow-sm flex flex-col items-center justify-center gap-2 disabled:opacity-50"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <div style={{ color }}>{icon}</div>
      )}
      <span className="text-xs font-medium text-foreground">{label}</span>
    </motion.button>
  );
}
