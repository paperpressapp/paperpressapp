"use client";

/**
 * ChapterList Component
 * 
 * Scrollable list of chapter items.
 */

import { motion } from "framer-motion";
import { ChapterItem } from "./ChapterItem";

interface ChapterListProps {
  /** Array of chapters with counts */
  chapters: Array<{
    id: string;
    number: number;
    name: string;
    mcqCount: number;
    shortCount: number;
    longCount: number;
  }>;
  /** Selected chapter IDs */
  selectedIds: string[];
  /** Toggle handler */
  onToggle: (chapterId: string) => void;
}

export function ChapterList({ chapters, selectedIds, onToggle }: ChapterListProps) {
  return (
    <div className="divide-y divide-gray-100/50 glass-panel rounded-2xl overflow-hidden">
      {chapters.map((chapter, index) => (
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
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
