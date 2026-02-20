"use client";

/**
 * HeroSection Component - Professional Design
 * 
 * Hero section with proper spacing and visual separation
 */

import { motion } from "framer-motion";
import { FileText, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "relative overflow-hidden bg-gradient-to-b from-[#1E88E5] to-[#1565C0] rounded-b-[32px]",
        className
      )}
    >
      {/* Content */}
      <motion.div
        className="relative px-6 pt-6 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Greeting */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-white/80 text-sm font-medium">Welcome back</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Hello, {userName || "User"}!
          </h1>
          <p className="text-white/70 text-sm">
            Ready to create amazing papers?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex items-center gap-4">
          <motion.div
            className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-[11px] font-medium uppercase tracking-wide">Papers</p>
                <p className="text-white text-xl font-bold leading-none mt-0.5">{totalPapers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-[11px] font-medium uppercase tracking-wide">Month</p>
                <p className="text-white text-xl font-bold leading-none mt-0.5">{papersThisMonth}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
