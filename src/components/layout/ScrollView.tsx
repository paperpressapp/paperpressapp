"use client";

import { cn } from "@/lib/utils";

interface ScrollViewProps {
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
  style?: React.CSSProperties;
}

export function ScrollView({
  children,
  className = "",
  horizontal = false,
  style,
}: ScrollViewProps) {
  return (
    <div
      className={cn(
        horizontal ? "overflow-x-auto overflow-y-hidden" : "overflow-auto",
        "h-full",
        className
      )}
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
