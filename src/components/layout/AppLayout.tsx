"use client";

/**
 * AppLayout Component
 * 
 * Main container wrapper for the app with mobile-first constraints.
 */

import { cn } from "@/lib/utils";
import { SafeArea } from "./SafeArea";
import { OfflineBanner } from "@/components/shared/OfflineBanner";

interface AppLayoutProps {
  /** Layout content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Whether to add top safe area padding */
  topSafe?: boolean;
  /** Whether to add bottom safe area padding */
  bottomSafe?: boolean;
}

export function AppLayout({
  children,
  className = "",
  topSafe = true,
  bottomSafe = true
}: AppLayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <OfflineBanner />
      {/* Centered container with max-width for mobile-first design */}
      <div
        className={cn(
          "mx-auto h-full max-w-[428px] bg-background relative overflow-hidden",
          className
        )}
      >
        <SafeArea top={topSafe} bottom={bottomSafe}>
          {children}
        </SafeArea>
      </div>
    </div>
  );
}
