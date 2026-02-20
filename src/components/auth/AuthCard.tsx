"use client";

/**
 * AuthCard Component
 * 
 * White card wrapper for authentication content.
 */

import { cn } from "@/lib/utils";

interface AuthCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.08)]",
        "px-6 pt-8 pb-8 flex flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}
