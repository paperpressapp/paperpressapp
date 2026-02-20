"use client";

/**
 * GenerateButton Component - Fixed positioning above bottom nav
 * 
 * Fixed bottom button to generate paper.
 * Positioned above the bottom navigation bar.
 */

import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  /** Total marks count */
  totalMarks: number;
  /** Total questions count */
  totalQuestions: number;
  /** Whether button is disabled */
  disabled: boolean;
  /** Generate handler */
  onGenerate: () => void;
}

export function GenerateButton({
  totalMarks,
  totalQuestions,
  disabled,
  onGenerate,
}: GenerateButtonProps) {
  return (
    <motion.div
      className="fixed bottom-[80px] left-0 right-0 z-30 px-4"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="mx-auto max-w-[428px]">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-4">
          {/* Summary */}
          <div className="flex items-center justify-center gap-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#1E88E5]">{totalMarks}</span>
              <span>Marks</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#1E88E5]">{totalQuestions}</span>
              <span>Questions</span>
            </div>
          </div>

          <Button
            onClick={onGenerate}
            disabled={disabled}
            className={cn(
              "w-full h-14 text-base font-semibold rounded-xl transition-all duration-200",
              disabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:opacity-90 shadow-lg shadow-[#1E88E5]/30"
            )}
          >
            <FileText className="w-5 h-5 mr-2" />
            Generate Paper
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
