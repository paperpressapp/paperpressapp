"use client";

/**
 * SafeArea Component
 * 
 * Wrapper that adds safe area insets for notched devices.
 * Uses CSS env() with fallbacks for older WebViews.
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
      style={{
        paddingTop: top ? 'max(16px, env(safe-area-inset-top, 16px))' : undefined,
        paddingBottom: bottom ? 'max(16px, env(safe-area-inset-bottom, 16px))' : undefined,
        paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
        paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
      }}
    >
      {children}
    </div>
  );
}
