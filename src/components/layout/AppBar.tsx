"use client";

/**
 * AppBar Component
 * 
 * Application header bar with navigation and actions.
 */

import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppBarProps {
  /** Page title */
  title?: string;
  /** Show back button */
  showBack?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Right side action element */
  rightAction?: React.ReactNode;
  /** Transparent background */
  transparent?: boolean;
  /** Fixed position */
  fixed?: boolean;
  /** Additional class names */
  className?: string;
}

export function AppBar({
  title,
  showBack = false,
  onBack,
  rightAction,
  transparent = false,
  fixed = true,
  className = "",
}: AppBarProps) {
  return (
    <header
      className={cn(
        "z-30 flex flex-col px-4 pt-safe",
        fixed && "fixed top-0 left-0 right-0",
        transparent ? "bg-transparent" : "bg-background/95 backdrop-blur-sm border-b",
        className
      )}
    >
      <div className="h-14 mx-auto max-w-[428px] w-full flex items-center justify-between">
        {/* Left section - Back button */}
        <div className="w-10">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : null}
        </div>

        {/* Center section - Title */}
        <div className="flex-1 text-center">
          {title && (
            <motion.h1
              className="text-base font-semibold text-foreground"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h1>
          )}
        </div>

        {/* Right section - Action */}
        <div className="w-10 flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
