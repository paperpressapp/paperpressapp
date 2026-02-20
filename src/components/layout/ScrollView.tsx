"use client";

import { cn } from "@/lib/utils";

interface ScrollViewProps {
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
}

export function ScrollView({
  children,
  className = "",
  horizontal = false,
}: ScrollViewProps) {
  return (
    <div
      className={cn(
        horizontal ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto overflow-x-hidden",
        "smooth-scroll scrollbar-hide",
        className
      )}
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </div>
  );
}
