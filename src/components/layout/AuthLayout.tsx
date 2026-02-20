"use client";

/**
 * AuthLayout Component
 * 
 * Layout for authentication pages (sign in, sign up, etc.).
 */

import { cn } from "@/lib/utils";
import { SafeArea } from "./SafeArea";

interface AuthLayoutProps {
  /** Layout content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Use gradient background */
  useGradient?: boolean;
}

export function AuthLayout({ 
  children, 
  className = "",
  useGradient = false 
}: AuthLayoutProps) {
  return (
    <div 
      className={cn(
        "min-h-screen",
        useGradient 
          ? "bg-gradient-to-br from-primary/5 via-background to-primary/10" 
          : "bg-background"
      )}
    >
      <SafeArea top bottom>
        <div className={cn("min-h-screen flex flex-col", className)}>
          {children}
        </div>
      </SafeArea>
    </div>
  );
}
