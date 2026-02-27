"use client";

/**
 * AppLayout Component
 * 
 * Main container wrapper for the app with mobile-first constraints.
 */

import { cn } from "@/lib/utils";
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
  const topPadding = topSafe ? 'env(safe-area-inset-top, 0px)' : '0px';
  const bottomPadding = bottomSafe ? 'env(safe-area-inset-bottom, 0px)' : '0px';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0A0A]">
      <OfflineBanner />
      {/* Centered container with max-width for mobile-first design */}
      <div
        className={cn(
          "mx-auto h-full max-w-[428px] w-full bg-[#0A0A0A] relative",
          className
        )}
        style={{
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
        }}
      >
        {children}
      </div>
    </div>
  );
}
