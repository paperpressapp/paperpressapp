"use client";

/**
 * QuestionItem Component
 * 
 * Single question item with checkbox for selection.
 */

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";
import { McqOptions } from "./McqOptions";
import { cn } from "@/lib/utils";
import type { MCQQuestion, ShortQuestion, LongQuestion } from "@/types";

interface QuestionItemProps {
  /** Question data */
  question: MCQQuestion | ShortQuestion | LongQuestion;
  /** Question type */
  type: "mcq" | "short" | "long";
  /** Whether selected */
  isSelected: boolean;
  /** Toggle handler */
  onToggle: () => void;
}

export function QuestionItem({ question, type, isSelected, onToggle }: QuestionItemProps) {
  const isMcq = type === "mcq";
  const mcqQuestion = isMcq ? (question as MCQQuestion) : null;

  return (
    <motion.button
      onClick={onToggle}
      className={cn(
        "w-full p-3 flex items-start gap-3 border-b transition-colors text-left",
        isSelected ? "bg-[#E3F2FD]" : "bg-white hover:bg-gray-50"
      )}
      whileTap={{ scale: 0.995 }}
    >
      {/* Checkbox */}
      <motion.div
        className={cn(
          "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
          isSelected 
            ? "bg-primary" 
            : "border-2 border-muted-foreground/30 bg-white"
        )}
        animate={{ scale: isSelected ? [1, 1.15, 1] : 1 }}
        transition={{ duration: 0.15 }}
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
      <div className="flex-1 min-w-0">
        {/* Question text */}
        <p className={cn(
          "text-sm text-foreground line-clamp-2",
          isSelected && "font-medium"
        )}>
          {question.questionText}
        </p>

        {/* MCQ Options */}
        {isMcq && mcqQuestion?.options && (
          <McqOptions options={mcqQuestion.options} />
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2">
          <DifficultyBadge difficulty={question.difficulty} />
          <span className="text-xs text-muted-foreground">
            {question.marks} mark{question.marks !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
