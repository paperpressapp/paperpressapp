"use client";

/**
 * ChapterItem Component
 * 
 * Individual chapter list item with checkbox.
 */

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/hooks";

interface ChapterItemProps {
  chapter: {
    id: string;
    number: number;
    name: string;
    mcqCount: number;
    shortCount: number;
    longCount: number;
  };
  isSelected: boolean;
  onToggle: () => void;
}

export function ChapterItem({ chapter, isSelected, onToggle }: ChapterItemProps) {
  const handleToggle = () => {
    triggerHaptic('light');
    onToggle();
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={cn(
        "w-full px-4 py-3 flex items-center gap-3 rounded-[12px] mb-2 transition-all",
        isSelected
          ? "bg-[#1A1A1A] border-2 border-[#B9FF66]/50"
          : "bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#B9FF66]/30"
      )}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Checkbox */}
      <motion.div
        className={cn(
          "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors",
          isSelected
            ? "bg-[#B9FF66] border-[#B9FF66]"
            : "border-[#2A2A2A] bg-transparent"
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
            <Check className="w-4 h-4 text-[#0A0A0A]" strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-[#B9FF66]/10 text-[#B9FF66] text-xs font-medium rounded-md">
            Ch {chapter.number}
          </span>
          <span className="text-sm font-medium text-white truncate">
            {chapter.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#6B6B6B]">
          <span>MCQ: {chapter.mcqCount}</span>
          <span>•</span>
          <span>Short: {chapter.shortCount}</span>
          <span>•</span>
          <span>Long: {chapter.longCount}</span>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-2 h-2 rounded-full bg-[#B9FF66]"
        />
      )}
    </motion.button>
  );
}
