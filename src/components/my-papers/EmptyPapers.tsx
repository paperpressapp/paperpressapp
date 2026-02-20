"use client";

/**
 * EmptyPapers Component
 * 
 * Empty state when no papers exist.
 */

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyPapersProps {
  /** Create button handler */
  onCreate: () => void;
}

export function EmptyPapers({ onCreate }: EmptyPapersProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-primary" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-foreground mb-2">
        No Papers Yet
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
        Create your first test paper and it will appear here
      </p>

      {/* Create Button */}
      <Button
        onClick={onCreate}
        className="bg-[#1E88E5] hover:bg-[#1565C0] h-12 px-8"
      >
        Create Paper
      </Button>
    </motion.div>
  );
}
