"use client";

/**
 * SelectionBar Component
 * 
 * Sticky bar showing selection count and clear option.
 */

import { motion, AnimatePresence } from "framer-motion";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectionBarProps {
  /** Number of selected chapters */
  selectedCount: number;
  /** Clear all handler */
  onClearAll: () => void;
}

export function SelectionBar({ selectedCount, onClearAll }: SelectionBarProps) {
  return (
    <motion.div
      className="sticky top-[56px] z-20 glass-panel rounded-2xl px-4 py-3 flex items-center justify-between"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">
          Selected: {selectedCount} chapter{selectedCount !== 1 ? 's' : ''}
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
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
