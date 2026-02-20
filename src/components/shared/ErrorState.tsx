"use client";

/**
 * ErrorState Component
 * 
 * Displayed when an error occurs.
 */

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Optional retry handler */
  onRetry?: () => void;
  /** Optional additional class names */
  className?: string;
}

export function ErrorState({
  message,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Error Icon */}
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>

      {/* Error Message */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </motion.div>
  );
}
