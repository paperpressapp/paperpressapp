"use client";

/**
 * Logo Component
 * 
 * Renders the PaperPress logo with configurable size and color variant.
 */

interface LogoProps {
  /** Logo size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "light" | "dark";
  /** Optional additional class names */
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export function Logo({ size = "md", variant = "dark", className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/logo.png" 
        alt="PaperPress" 
        className={sizeClasses[size]} 
      />
    </div>
  );
}
