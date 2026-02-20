"use client";

/**
 * Badge Component
 * 
 * Pill-shaped badge for displaying status or counts.
 */

import { cn } from "@/lib/utils";

interface BadgeProps {
  /** Badge color variant */
  variant?: "default" | "success" | "warning" | "error" | "info";
  /** Badge size */
  size?: "sm" | "md";
  /** Badge content */
  children: React.ReactNode;
  /** Optional additional class names */
  className?: string;
}

const variantClasses = {
  default: "bg-primary/10 text-primary border-primary/20",
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  error: "bg-red-100 text-red-700 border-red-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
};

const sizeClasses = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
};

export function Badge({
  variant = "default",
  size = "sm",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
