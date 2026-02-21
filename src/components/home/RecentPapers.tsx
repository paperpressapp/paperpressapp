"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, ChevronRight } from "lucide-react";
import type { GeneratedPaper } from "@/types";

interface RecentPapersProps {
  papers: GeneratedPaper[];
}

export function RecentPapers({ papers }: RecentPapersProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!papers || papers.length === 0) return null;

  return (
    <div ref={dropdownRef} className="px-5 py-3">
      {/* Dropdown Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Recent Papers</p>
            <p className="text-xs text-gray-500">{papers.length} paper{papers.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {papers.slice(0, 5).map((paper, index) => {
                const colors = [
                  'from-[#1E88E5] to-[#1565C0]',
                  'from-emerald-400 to-green-500',
                  'from-violet-500 to-purple-600',
                  'from-amber-400 to-orange-500',
                  'from-rose-400 to-pink-500',
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <button
                    key={paper.id}
                    onClick={() => {
                      router.push(`/paper?id=${paper.id}`);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md`}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{paper.title}</p>
                        <p className="text-xs text-gray-500">{paper.classId} • {paper.subject}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
              
              {papers.length > 5 && (
                <button
                  onClick={() => {
                    router.push("/my-papers");
                    setIsOpen(false);
                  }}
                  className="w-full text-center py-3 text-[#1E88E5] font-medium text-sm hover:underline"
                >
                  View All Papers →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
