"use client";

/**
 * RecentPaperCard Component - Redesigned
 * 
 * Card displaying a recently generated paper.
 * Improved styling with glassmorphism effect.
 */

import { motion } from "framer-motion";
import { FileText, Calendar, ChevronRight, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { GeneratedPaper } from "@/types";

interface RecentPaperCardProps {
  /** Paper data */
  paper: GeneratedPaper;
  /** Press handler */
  onPress: () => void;
}

export function RecentPaperCard({ paper, onPress }: RecentPaperCardProps) {
  return (
    <motion.button
      onClick={onPress}
      className={cn(
        "flex-shrink-0 w-[220px] glass-panel rounded-lg p-4",
        "shadow-sm hover:shadow-lg transition-all duration-300 text-left"
      )}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Header with icon */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
            {paper.title}
          </h3>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-[#1E88E5]" />
            <span className="text-xs font-medium text-[#1E88E5]">
              {paper.subject}
            </span>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-1.5 text-gray-500 mb-3">
        <Calendar className="w-3.5 h-3.5" />
        <span className="text-xs">{formatDate(paper.date)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-600">
          {paper.questionCount} Questions
        </span>
        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center">
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
    </motion.button>
  );
}
