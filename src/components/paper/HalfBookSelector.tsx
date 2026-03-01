"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "@/hooks";

interface HalfBookSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHalf: (half: 'first' | 'second') => void;
  totalChapters?: number;
}

export function HalfBookSelector({ isOpen, onClose, onSelectHalf, totalChapters = 0 }: HalfBookSelectorProps) {
  const halfCount = Math.ceil(totalChapters / 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md mx-auto bg-[#1A1A1A] rounded-t-[32px] overflow-hidden border-t border-[#2A2A2A]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
          >
            <div className="p-5 border-b border-[#2A2A2A]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#B9FF66]/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#B9FF66]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Select Half</h2>
                    <p className="text-xs text-[#9CA3AF]">Choose which half to include</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full bg-[#2A2A2A]">
                  <X className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <motion.button
                onClick={() => { triggerHaptic('medium'); onSelectHalf('first'); onClose(); }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-[#2A2A2A] border border-[#3A3A3A] hover:border-[#B9FF66]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-emerald-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-emerald-400">1</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">First Half</p>
                  <p className="text-xs text-[#9CA3AF]">Chapters 1 - {halfCount}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#B9FF66]" />
              </motion.button>
              <motion.button
                onClick={() => { triggerHaptic('medium'); onSelectHalf('second'); onClose(); }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-[#2A2A2A] border border-[#3A3A3A] hover:border-[#B9FF66]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-violet-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-violet-400">2</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">Second Half</p>
                  <p className="text-xs text-[#9CA3AF]">Chapters {halfCount + 1} - {totalChapters}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#B9FF66]" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
