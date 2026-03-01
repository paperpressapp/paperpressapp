"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TemplateSummary } from "@/types/template";
import { getCategoryIcon } from "@/lib/template-store";
import { Clock, FileText, Layers } from "lucide-react";

interface TemplateCardProps {
  template: TemplateSummary;
  isSelected: boolean;
  onSelect: (templateId: string) => void;
  onEdit?: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
}

export function TemplateCard({
  template,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  const icon = getCategoryIcon(template.category);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(template.id)}
      className={cn(
        "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
        isSelected
          ? "border-[#1E88E5] bg-[#1E88E5]/10 shadow-lg"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md",
        template.type === 'custom' && "border-l-4 border-l-[#FF9800]"
      )}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-[#1E88E5] flex items-center justify-center">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Card Content */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg text-2xl",
          isSelected ? "bg-[#1E88E5]/20" : "bg-gray-100"
        )}>
          {icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-gray-900 truncate",
            isSelected && "text-[#1E88E5]"
          )}>
            {template.name}
          </h3>

          {/* Stats */}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{template.totalMarks} Marks</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{template.timeAllowed}</span>
            </div>
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              <span>{template.sectionCount} Sections</span>
            </div>
          </div>

          {/* Question Count */}
          <p className="mt-1 text-xs text-gray-400">
            ~{template.questionCount} Questions
          </p>
        </div>
      </div>

      {/* Type Badge */}
      <div className="absolute -bottom-2 -right-2">
        {template.type === 'predefined' ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            Board Pattern
          </span>
        ) : (
          <span className="rounded-full bg-[#FF9800]/10 px-2 py-0.5 text-[10px] font-medium text-[#FF9800]">
            Custom
          </span>
        )}
      </div>
    </motion.div>
  );
}
