"use client";

/**
 * SafeArea Component
 * 
 * Wrapper that adds safe area insets for notched devices.
 */

import { cn } from "@/lib/utils";

interface SafeAreaProps {
  /** Content to wrap */
  children: React.ReactNode;
  /** Add top safe area padding */
  top?: boolean;
  /** Add bottom safe area padding */
  bottom?: boolean;
  /** Additional class names */
  className?: string;
}

export function SafeArea({
  children,
  top = true,
  bottom = true,
  className = "",
}: SafeAreaProps) {
  return (
    <div
      className={cn(
        "h-full w-full",
        top && "pt-safe",
        bottom && "pb-safe",
        className
      )}
    >
      {children}
    </div>
  );
}
