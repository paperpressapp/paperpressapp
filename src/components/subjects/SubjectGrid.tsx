"use client";

/**
 * SubjectGrid Component
 * 
 * Grid of subject cards for selection.
 */

import { motion } from "framer-motion";
import { SubjectCard } from "./SubjectCard";
import { SUBJECTS } from "@/constants/subjects";

interface SubjectGridProps {
  /** Current class ID */
  classId: string;
  /** Array of subject IDs */
  subjects: typeof SUBJECTS;
  /** Chapter counts per subject */
  chapterCounts: Record<string, number>;
  /** Selection handler */
  onSelect: (subjectId: string) => void;
}

export function SubjectGrid({ 
  classId, 
  subjects, 
  chapterCounts, 
  onSelect 
}: SubjectGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {subjects.map((subject, index) => (
        <motion.div
          key={subject.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <SubjectCard
            subject={subject}
            chapterCount={chapterCounts[subject.id] || 0}
            onPress={() => onSelect(subject.id)}
          />
        </motion.div>
      ))}
    </div>
  );
}
