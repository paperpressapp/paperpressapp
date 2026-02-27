"use client";

/**
 * SubjectHeader Component
 * 
 * Gradient header card for subject selection.
 */

import { motion } from "framer-motion";
import { CLASSES } from "@/constants/classes";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface SubjectHeaderProps {
  /** Current class ID */
  classId: string;
}

export function SubjectHeader({ classId }: SubjectHeaderProps) {
  // Get class info and color
  const classInfo = CLASSES.find((c) => c.id === classId);
  const classColor = classInfo?.color || "#1E88E5";

  return (
    <motion.div
      className={cn(
        "relative h-[100px] rounded-2xl overflow-hidden mb-6",
        "flex items-center px-6"
      )}
      style={{ background: `linear-gradient(135deg, ${classColor}, ${classColor}dd)` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-2 right-4 w-16 h-16 rounded-full bg-white/10" />
        <div className="absolute bottom-4 left-8 w-12 h-12 rounded-full bg-white/5" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-white" />
          <h1 className="text-white text-xl font-bold">
            Choose Subject
          </h1>
        </div>
        <p className="text-white/80 text-sm">
          Select one subject to continue
        </p>
      </div>
    </motion.div>
  );
}
