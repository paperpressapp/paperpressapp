"use client";

/**
 * QuestionTypeCard Component
 * 
 * Card for selecting questions of a specific type.
 */

import { motion } from "framer-motion";
import { FileText, HelpCircle, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared";
import { cn } from "@/lib/utils";

interface QuestionTypeCardProps {
  /** Question type */
  type: "mcq" | "short" | "long";
  /** Number of selected questions */
  selectedCount: number;
  /** Number of available questions */
  availableCount: number;
  /** Marks per question */
  marksPerQuestion: number;
  /** Add click handler */
  onAddClick: () => void;
}

const typeConfig = {
  mcq: {
    icon: FileText,
    title: "Section A: Multiple Choice Questions",
    iconBg: "#E3F2FD",
    iconColor: "#1E88E5",
    borderColor: "#1E88E5",
    buttonText: "Add MCQs",
  },
  short: {
    icon: HelpCircle,
    title: "Section B: Short Questions",
    iconBg: "#DCFCE7",
    iconColor: "#22C55E",
    borderColor: "#22C55E",
    buttonText: "Add Short Questions",
  },
  long: {
    icon: BookOpen,
    title: "Section C: Long Questions",
    iconBg: "#FEF3C7",
    iconColor: "#F59E0B",
    borderColor: "#F59E0B",
    buttonText: "Add Long Questions",
  },
};

export function QuestionTypeCard({
  type,
  selectedCount,
  availableCount,
  marksPerQuestion,
  onAddClick,
}: QuestionTypeCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const marks = selectedCount * marksPerQuestion;
  const progress = availableCount > 0 ? (selectedCount / availableCount) * 100 : 0;

  return (
    <motion.div
      className={cn(
        "glass-panel rounded-2xl overflow-hidden",
        "flex flex-col"
      )}
      style={{ borderLeftWidth: "4px", borderLeftColor: config.borderColor }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: config.iconBg }}
          >
            <Icon className="w-6 h-6" style={{ color: config.iconColor }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              {config.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {selectedCount}/{availableCount} selected • {marks} marks
            </p>

            {/* Progress bar */}
            <ProgressBar
              value={progress}
              color={config.borderColor}
              height={4}
              showLabel={false}
            />
          </div>
        </div>
      </div>

      {/* Add button */}
      <div className="px-4 pb-4">
        <Button
          variant="outline"
          onClick={onAddClick}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {selectedCount > 0 ? "Edit Selection" : config.buttonText}
        </Button>
      </div>
    </motion.div>
  );
}
