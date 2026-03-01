"use client";

/**
 * SelectionBar Component
 * 
 * Sticky bar showing selection count and clear option.
 */

import { motion, AnimatePresence } from "framer-motion";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "@/hooks";

interface SelectionBarProps {
  selectedCount: number;
  onClearAll: () => void;
}

export function SelectionBar({ selectedCount, onClearAll }: SelectionBarProps) {
  const handleClear = () => {
    triggerHaptic('light');
    onClearAll();
  };

  return (
    <motion.div
      className="sticky top-[56px] z-20 bg-[#1A1A1A] rounded-[16px] px-4 py-3 flex items-center justify-between border border-[#2A2A2A]"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#B9FF66]/20 flex items-center justify-center">
          <FileText className="w-4 h-4 text-[#B9FF66]" />
        </div>
        <span className="text-sm font-medium text-white">
          {selectedCount} chapter{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>

      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-[#FF4D4D] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
