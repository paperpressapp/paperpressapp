"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface EmptyStateProps {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Empty state title */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /** Optional secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Optional additional class names */
  className?: string;
  /** Glow color (hex or CSS var) */
  glowColor?: string;
  /** Size variant */
  size?: "md" | "lg";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
  glowColor = "#B9FF66",
  size = "lg",
}: EmptyStateProps) {
  const isCompact = size === "md";

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center text-center px-8 rounded-[40px] relative overflow-hidden",
        isCompact ? "py-10" : "py-16",
        "glass-panel-dark border-white/5 shadow-2xl mx-auto max-w-lg",
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
    >
      {/* Dynamic Background Glow */}
      <div
        className="absolute -top-24 -left-24 w-48 h-48 blur-[80px] opacity-10 rounded-full"
        style={{ backgroundColor: glowColor }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-48 h-48 blur-[80px] opacity-10 rounded-full"
        style={{ backgroundColor: glowColor }}
      />

      {/* Animated Icon Container */}
      <div className={cn("relative", isCompact ? "mb-6" : "mb-8")}>
        <motion.div
          className={cn(
            "rounded-3xl flex items-center justify-center relative bg-white/[0.03] border border-white/10 overflow-hidden",
            isCompact ? "w-16 h-16" : "w-20 h-20"
          )}
          animate={{
            boxShadow: [
              `0 0 0px ${glowColor}00`,
              `0 0 20px ${glowColor}20`,
              `0 0 0px ${glowColor}00`
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {/* Pulsing inner glow */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{ backgroundColor: glowColor }}
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className={cn("relative z-10 text-white opacity-80", isCompact ? "scale-100" : "scale-110")}>
            {icon}
          </div>
        </motion.div>

        {/* Orbital Ring */}
        <motion.div
          className={cn(
            "absolute border border-dashed border-white/5 rounded-full",
            isCompact ? "-inset-3" : "-inset-4"
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Text Content */}
      <div className={cn("relative z-10 space-y-3", isCompact ? "mb-8" : "mb-10")}>
        <h3 className={cn(
          "font-black text-white tracking-tight drop-shadow-sm",
          isCompact ? "text-xl" : "text-2xl"
        )}>
          {title}
        </h3>
        <p className={cn(
          "font-medium text-[#A0A0A0] leading-relaxed mx-auto italic",
          isCompact ? "text-sm max-w-[240px]" : "text-base max-w-[280px]"
        )}>
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-[#B9FF66] hover:bg-[#A3E635] text-black font-black px-8 h-12 rounded-lg transition-all active:scale-95 shadow-[0_8px_20px_-4px_rgba(185,255,102,0.3)] group"
          >
            {action.icon && <span className="mr-2 group-hover:rotate-12 transition-transform">{action.icon}</span>}
            {action.label}
          </Button>
        )}

        {secondaryAction && (
          <Button
            variant="ghost"
            onClick={secondaryAction.onClick}
            className="text-white/60 hover:text-white hover:bg-white/5 font-bold h-12 px-6 rounded-lg"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
