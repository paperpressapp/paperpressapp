"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, Clock, Award, Calendar } from "lucide-react";
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return (
    <div ref={dropdownRef} className="px-5 py-3">
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white rounded-3xl p-4 shadow-sm border border-gray-100 active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E40AF] to-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 text-lg">Recent Papers</p>
            <p className="text-sm text-gray-500">{papers.length} paper{papers.length !== 1 ? 's' : ''} generated</p>
          </div>
        </div>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }} 
          transition={{ duration: 0.2 }}
          className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              {papers.slice(0, 5).map((paper, index) => {
                const colors = [
                  'from-blue-500 to-indigo-600',
                  'from-emerald-400 to-green-600',
                  'from-violet-500 to-purple-600',
                  'from-amber-400 to-orange-500',
                  'from-rose-400 to-pink-500',
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <motion.button
                    key={paper.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      router.push(`/paper?id=${paper.id}`);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between bg-gray-50 rounded-2xl p-4 active:bg-gray-100 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md group-active:scale-95 transition-transform`}>
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 truncate max-w-[160px]">{paper.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{paper.classId}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs font-medium text-gray-500">{paper.subject}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{formatDate(paper.createdAt)}</span>
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Award className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
              
              {papers.length > 5 && (
                <button
                  onClick={() => {
                    router.push("/my-papers");
                    setIsOpen(false);
                  }}
                  className="w-full text-center py-4 text-[#1E40AF] font-bold text-sm hover:underline flex items-center justify-center gap-2"
                >
                  View All Papers
                  <Calendar className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
