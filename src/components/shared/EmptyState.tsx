"use client";

/**
 * EmptyState Component
 * 
 * Displayed when there's no content to show.
 */

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Empty state title */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional additional class names */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {description}
      </p>

      {/* Action */}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
