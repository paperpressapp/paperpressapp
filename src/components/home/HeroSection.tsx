"use client";

import { FileText, Calendar, Sparkles, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { UsageProgressBar } from "./UsageProgressBar";
import { motion } from "framer-motion";

interface HeroSectionProps {
  userName: string;
  totalPapers: number;
  papersThisMonth: number;
  className?: string;
}

export function HeroSection({
  userName,
  totalPapers,
  papersThisMonth,
  className = "",
}: HeroSectionProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-[#1E40AF] via-[#1E56B8] to-[#2563EB] rounded-b-xl",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full blur-lg" />
        <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-amber-400/20 rounded-full blur-md" />
      </div>
      
      <div className="relative px-3 pt-4 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-3"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20">
              <Sparkles className="w-2.5 text-amber-300" />
              <span className="text-white/90 text-[9px] font-medium">Welcome</span>
            </div>
          </div>
          <h1 className="text-white text-lg font-bold mb-0.5">
            Hello, {userName || "User"}!
          </h1>
          <p className="text-white/70 text-xs">
            Ready to create exam papers?
          </p>
        </motion.div>

        {totalPapers === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/20 backdrop-blur-xl rounded-xl p-3 border border-white/30 shadow-lg"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Start Creating!</p>
                <p className="text-white/60 text-[10px]">Generate exam papers</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/subjects'}
              className="w-full bg-white text-[#1E40AF] py-2 rounded-lg font-semibold text-xs shadow active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Get Started
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-stretch gap-2"
          >
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-white/20 backdrop-blur-xl rounded-xl p-2.5 border border-white/30 shadow-md"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-[8px] font-semibold uppercase">Total</p>
                  <p className="text-white text-lg font-black leading-none">{totalPapers}</p>
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5 text-emerald-300" />
                <span className="text-white/60 text-[9px]">All time</span>
              </div>
            </motion.div>

            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-white/20 backdrop-blur-xl rounded-xl p-2.5 border border-white/30 shadow-md"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-300/30 to-orange-400/30 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-[8px] font-semibold uppercase">This Month</p>
                  <p className="text-white text-lg font-black leading-none">{papersThisMonth}</p>
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <Award className="w-2.5 h-2.5 text-amber-300" />
                <span className="text-white/60 text-[9px]">Keep it up!</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-3"
        >
          <UsageProgressBar />
        </motion.div>
      </div>
    </div>
  );
}
