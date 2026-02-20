"use client";

/**
 * SummaryBar Component
 * 
 * Sticky summary bar showing question counts and total marks.
 */

import { FileText, HelpCircle, BookOpen, Calculator } from "lucide-react";
import { SummaryItem } from "./SummaryItem";
import { Badge } from "@/components/shared";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SummaryBarProps {
  /** Number of MCQs selected */
  mcqCount: number;
  /** Number of short questions selected */
  shortCount: number;
  /** Number of long questions selected */
  longCount: number;
  /** Marks per MCQ (default: 1) */
  mcqMarks?: number;
  /** Marks per short (default: 5) */
  shortMarks?: number;
  /** Marks per long (default: 10) */
  longMarks?: number;
  /** Additional class names */
  className?: string;
}

export function SummaryBar({
  mcqCount,
  shortCount,
  longCount,
  mcqMarks = 1,
  shortMarks = 5,
  longMarks = 10,
  className = "",
}: SummaryBarProps) {
  const totalQuestions = mcqCount + shortCount + longCount;
  const totalMarks = (mcqCount * mcqMarks) + (shortCount * shortMarks) + (longCount * longMarks);

  const stats = [
    {
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      iconBgColor: "#E3F2FD",
      count: mcqCount,
      label: "MCQs",
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-green-600" />,
      iconBgColor: "#DCFCE7",
      count: shortCount,
      label: "Short",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-orange-600" />,
      iconBgColor: "#FEF3C7",
      count: longCount,
      label: "Long",
    },
    {
      icon: <Calculator className="w-5 h-5 text-[#1E88E5]" />,
      iconBgColor: "#E3F2FD",
      count: totalMarks,
      label: "Marks",
    },
  ];

  return (
    <motion.div
      className={cn(
        "sticky top-[56px] z-20 mx-4 bg-card rounded-xl shadow-md border",
        "p-4 mb-4",
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stats Row */}
      <div className="flex items-stretch">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex items-center">
            <SummaryItem {...stat} />
            {index < stats.length - 1 && (
              <div className="w-px h-12 bg-border mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Total Badge */}
      <div className="flex justify-center mt-3 pt-3 border-t">
        <Badge variant="default" size="md">
          Total: {totalQuestions} Question{totalQuestions !== 1 ? 's' : ''}
        </Badge>
      </div>
    </motion.div>
  );
}
