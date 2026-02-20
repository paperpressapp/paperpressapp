"use client";

/**
 * SubjectCard Component
 * 
 * Card for selecting a subject.
 */

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { SubjectIcon } from "./SubjectIcon";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  /** Subject information */
  subject: {
    id: string;
    name: string;
    color: string;
    icon: string;
    chapterCount: number;
  };
  /** Number of chapters */
  chapterCount: number;
  /** Press handler */
  onPress: () => void;
}

export function SubjectCard({ subject, chapterCount, onPress }: SubjectCardProps) {
  return (
    <motion.button
      onClick={onPress}
      className={cn(
        "relative w-full h-[120px] bg-card rounded-2xl border overflow-hidden",
        "shadow-sm hover:shadow-md transition-shadow",
        "flex flex-col items-center justify-center p-4 text-center"
      )}
      style={{ borderTopWidth: "3px", borderTopColor: subject.color }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
    >
      {/* Subject icon in colored circle */}
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
        style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
      >
        <SubjectIcon subject={subject.name} size={20} />
      </div>

      {/* Subject name */}
      <h3 className="text-base font-bold text-foreground mb-1">
        {subject.name}
      </h3>

      {/* Chapter count */}
      <div className="flex items-center gap-1 text-muted-foreground">
        <BookOpen className="w-3 h-3" />
        <span className="text-xs">{chapterCount} Chapters</span>
      </div>
    </motion.button>
  );
}
