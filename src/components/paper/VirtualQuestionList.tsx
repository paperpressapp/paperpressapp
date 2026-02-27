"use client";

import { useRef, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MCQQuestion, ShortQuestion, LongQuestion } from "@/types";

interface Question {
  id: string;
  questionText: string;
  difficulty?: string;
  chapterNumber?: number;
  chapterName?: string;
  options?: string[];
}

interface VirtualQuestionListProps {
  questions: Question[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  difficultyColors: Record<string, { bg: string; color: string; label: string }>;
}

export function VirtualQuestionList({
  questions,
  selectedIds,
  onToggle,
  difficultyColors,
}: VirtualQuestionListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: questions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const q = questions[virtualRow.index];
          const isSelected = selectedIds.includes(q.id);
          const diff = difficultyColors[q.difficulty || "medium"];
          const mcqOptions = 'options' in q ? (q as MCQQuestion).options : null;

          return (
            <div
              key={q.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="p-2"
            >
              <button
                onClick={() => onToggle(q.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left touch-manipulation",
                  isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 bg-white"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    isSelected ? "bg-[#1E88E5] border-[#1E88E5]" : "border-gray-300"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#111827]">{q.questionText}</p>
                  {mcqOptions && Array.isArray(mcqOptions) && (
                    <div className="mt-2 space-y-1">
                      {mcqOptions.map((opt: string, idx: number) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                          <span className="font-medium">{String.fromCharCode(97 + idx)})</span> {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                    diff?.bg || "bg-gray-100",
                    diff?.color || "text-gray-600"
                  )}
                >
                  {diff?.label || q.difficulty}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
