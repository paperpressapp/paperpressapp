"use client";

/**
 * ChapterAccordion Component
 * 
 * Accordion for grouping questions by chapter.
 */

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/shared";

interface ChapterAccordionProps {
  /** Chapter name */
  chapterName: string;
  /** Chapter number */
  chapterNumber: number;
  /** Number of questions */
  questionCount: number;
  /** Whether expanded */
  isExpanded: boolean;
  /** Toggle handler */
  onToggle: () => void;
  /** Accordion content */
  children: React.ReactNode;
}

export function ChapterAccordion({
  chapterName,
  chapterNumber,
  questionCount,
  isExpanded,
  onToggle,
  children,
}: ChapterAccordionProps) {
  return (
    <div className="border-b last:border-b-0">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm text-foreground">
            Ch {chapterNumber}: {chapterName}
          </span>
          <Badge variant="default" size="sm">
            {questionCount}
          </Badge>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
