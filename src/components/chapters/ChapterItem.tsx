"use client";

/**
 * ChapterItem Component
 * 
 * Individual chapter list item with checkbox.
 */

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterItemProps {
  /** Chapter data */
  chapter: {
    id: string;
    number: number;
    name: string;
    mcqCount: number;
    shortCount: number;
    longCount: number;
  };
  /** Whether selected */
  isSelected: boolean;
  /** Toggle handler */
  onToggle: () => void;
}

export function ChapterItem({ chapter, isSelected, onToggle }: ChapterItemProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={cn(
        "w-full h-[72px] px-4 flex items-center gap-4 border-b transition-colors",
        isSelected ? "bg-[#E3F2FD]" : "bg-card hover:bg-accent/50"
      )}
      whileTap={{ scale: 0.99 }}
    >
      {/* Checkbox */}
      <motion.div
        className={cn(
          "w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors",
          isSelected 
            ? "bg-primary border-primary" 
            : "border-muted-foreground/30 bg-white"
        )}
        animate={{
          scale: isSelected ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className="w-4 h-4 text-primary-foreground" />
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
            Ch {chapter.number}
          </span>
          <span className="text-sm font-medium text-foreground truncate">
            {chapter.name}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          MCQs: {chapter.mcqCount} | Short: {chapter.shortCount} | Long: {chapter.longCount}
        </p>
      </div>
    </motion.button>
  );
}
