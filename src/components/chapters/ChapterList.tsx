"use client";

/**
 * ChapterList Component
 * 
 * Scrollable list of chapter items.
 */

import { motion } from "framer-motion";
import { ChapterItem } from "./ChapterItem";

interface ChapterListProps {
  chapters: Array<{
    id: string;
    number: number;
    name: string;
    mcqCount: number;
    shortCount: number;
    longCount: number;
  }>;
  selectedIds: string[];
  onToggle: (chapterId: string) => void;
}

export function ChapterList({ chapters, selectedIds, onToggle }: ChapterListProps) {
  return (
    <div className="space-y-1">
      {chapters.map((chapter, index) => (
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.02 }}
        >
          <ChapterItem
            chapter={chapter}
            isSelected={selectedIds.includes(chapter.id)}
            onToggle={() => onToggle(chapter.id)}
          />
        </motion.div>
      ))}
    </div>
  );
}
