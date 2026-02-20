"use client";

/**
 * AppLayout Component
 * 
 * Main container wrapper for the app with mobile-first constraints.
 */

import { cn } from "@/lib/utils";
import { SafeArea } from "./SafeArea";

interface AppLayoutProps {
  /** Layout content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function AppLayout({ children, className = "" }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Centered container with max-width for mobile-first design */}
      <div
        className={cn(
          "mx-auto min-h-screen max-w-[428px] bg-background relative",
          className
        )}
      >
        <SafeArea>
          {children}
        </SafeArea>
      </div>
    </div>
  );
}
