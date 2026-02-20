"use client";

/**
 * Logo Component
 * 
 * Renders the PaperPress logo with configurable size and color variant.
 */

import { FileText } from "lucide-react";

interface LogoProps {
  /** Logo size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "light" | "dark";
  /** Optional additional class names */
  className?: string;
}

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-[32px]",
};

const variantClasses = {
  light: "text-white",
  dark: "text-primary",
};

export function Logo({ size = "md", variant = "dark", className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FileText 
        className={`${sizeClasses[size]} ${variantClasses[variant]}`} 
        strokeWidth={2.5}
      />
      <span
        className={`font-bold tracking-tight ${sizeClasses[size]} ${variantClasses[variant]}`}
      >
        PaperPress
      </span>
    </div>
  );
}
