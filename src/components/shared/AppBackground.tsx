"use client";

/**
 * AppBackground Component
 * 
 * Reusable gradient background with decorative circles (splash screen style)
 * and optional glassmorphism overlay for content areas
 */

import { cn } from "@/lib/utils";

interface AppBackgroundProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  showGlassmorphism?: boolean;
  variant?: "gradient" | "solid";
}

export function AppBackground({
  children,
  className = "",
  contentClassName = "",
  showGlassmorphism = true,
  variant = "gradient",
}: AppBackgroundProps) {
  return (
    <div 
      className={cn(
        "min-h-screen relative overflow-hidden",
        variant === "gradient" 
          ? "bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0]"
          : "bg-[#1565C0]",
        className
      )}
    >
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-white/[0.05] blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl" />
        
        {/* Small accent circles */}
        <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-white/[0.08]" />
        <div className="absolute top-40 left-10 w-16 h-16 rounded-full bg-white/[0.06]" />
        <div className="absolute bottom-40 right-10 w-20 h-20 rounded-full bg-white/[0.05]" />
        <div className="absolute top-1/3 left-1/3 w-12 h-12 rounded-full bg-white/[0.07]" />
      </div>

      {/* Content container with optional glassmorphism */}
      <div 
        className={cn(
          "relative z-10 min-h-screen",
          showGlassmorphism && "flex flex-col"
        )}
      >
        {showGlassmorphism ? (
          <div 
            className={cn(
              "flex-1 mx-auto w-full max-w-[428px]",
              "bg-white/95 backdrop-blur-xl",
              "shadow-2xl",
              "overflow-hidden",
              contentClassName
            )}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/**
 * GlassCard Component
 * 
 * Glassmorphism card with blur effect
 */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark" | "colored";
}

export function GlassCard({ 
  children, 
  className = "",
  variant = "light" 
}: GlassCardProps) {
  const variantStyles = {
    light: "bg-white/80 backdrop-blur-md border-white/40 shadow-lg",
    dark: "bg-black/20 backdrop-blur-md border-white/10 shadow-lg",
    colored: "bg-[#1E88E5]/20 backdrop-blur-md border-white/20 shadow-lg",
  };

  return (
    <div 
      className={cn(
        "rounded-2xl border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
