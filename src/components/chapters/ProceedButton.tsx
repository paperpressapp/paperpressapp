"use client";

/**
 * ProceedButton Component - Fixed positioning above bottom nav
 * 
 * Fixed bottom button to proceed to question selection.
 * Positioned above the bottom navigation bar.
 */

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProceedButtonProps {
  /** Number of selected chapters */
  selectedCount: number;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Proceed handler */
  onProceed: () => void;
}

export function ProceedButton({ selectedCount, disabled, onProceed }: ProceedButtonProps) {
  const isEnabled = selectedCount > 0 && !disabled;

  return (
    <motion.div
      className="fixed bottom-[80px] left-0 right-0 z-30 px-4"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="mx-auto max-w-[428px]">
        <div className="bg-[var(--background-card)] backdrop-blur-xl rounded-lg shadow-lg border border-[var(--border-color)] p-4">
          <Button
            onClick={onProceed}
            disabled={!isEnabled}
            className={cn(
              "w-full h-14 text-base font-semibold rounded-xl transition-all duration-200",
              isEnabled
                ? "bg-gradient-to-r from-[#B9FF66] to-[#22c55e] hover:opacity-90 shadow-lg shadow-[#B9FF66]/30 text-[#0A0A0A]"
                : "bg-[var(--border-color)] text-[var(--text-secondary)] cursor-not-allowed"
            )}
          >
            <span>Continue to Questions</span>
            {selectedCount > 0 && (
              <span className="ml-2 text-sm opacity-90">({selectedCount})</span>
            )}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
