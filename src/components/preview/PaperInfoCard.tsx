"use client";

/**
 * PaperInfoCard Component
 * 
 * Displays paper information summary.
 */

import { motion } from "framer-motion";
import { Badge } from "@/components/shared";
import { Calendar, Clock, FileText, Award } from "lucide-react";
import type { GeneratedPaper } from "@/types";

interface PaperInfoCardProps {
  /** Paper data */
  paper: GeneratedPaper;
}

export function PaperInfoCard({ paper }: PaperInfoCardProps) {
  return (
    <motion.div
      className="bg-card rounded-xl border shadow-sm p-4 mx-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Title */}
      <h1 className="text-lg font-bold text-foreground mb-3">
        {paper.title}
      </h1>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="default" size="sm">
          {paper.classId} Class
        </Badge>
        <Badge variant="default" size="sm">
          {paper.subject}
        </Badge>
        <Badge variant="success" size="sm">
          {paper.examType}
        </Badge>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          <span>{paper.questionCount} questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4" />
          <span>{paper.totalMarks} marks</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{paper.timeAllowed}</span>
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t text-xs text-muted-foreground">
        <Calendar className="w-3.5 h-3.5" />
        <span>Created: {new Date(paper.createdAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}
