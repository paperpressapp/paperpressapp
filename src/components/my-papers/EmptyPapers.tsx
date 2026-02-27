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
      {/* SVG Illustration */}
      <svg 
        className="w-32 h-32 mb-6 text-gray-300" 
        viewBox="0 0 120 120" 
        fill="none"
      >
        <rect x="20" y="15" width="80" height="95" rx="8" fill="#E5E7EB" />
        <rect x="30" y="30" width="60" height="6" rx="3" fill="#9CA3AF" />
        <rect x="30" y="42" width="45" height="4" rx="2" fill="#D1D5DB" />
        <rect x="30" y="52" width="50" height="4" rx="2" fill="#D1D5DB" />
        <rect x="30" y="62" width="40" height="4" rx="2" fill="#D1D5DB" />
        <rect x="30" y="78" width="35" height="4" rx="2" fill="#9CA3AF" />
        <rect x="30" y="90" width="25" height="4" rx="2" fill="#9CA3AF" />
        <circle cx="85" cy="85" r="20" fill="#B9FF66" opacity="0.2" />
        <path 
          d="M78 85L82 89L92 79" 
          stroke="#B9FF66" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>

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
        className="bg-[#B9FF66] hover:bg-[#22c55e] text-[#0A0A0A] h-12 px-8"
      >
        Create Paper
      </Button>
    </motion.div>
  );
}
