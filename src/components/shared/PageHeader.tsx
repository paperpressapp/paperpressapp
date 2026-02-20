"use client";

/**
 * PageHeader Component
 * 
 * Consistent header for all pages with optional back button and right action.
 */

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Show back arrow button */
  showBack?: boolean;
  /** Back button click handler */
  onBack?: () => void;
  /** Right side action element */
  rightAction?: React.ReactNode;
  /** Optional additional class names */
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`sticky top-0 z-10 bg-background border-b ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section */}
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0 h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {/* Title section */}
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-foreground leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right section */}
        {rightAction && (
          <div className="shrink-0 ml-2">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
}
